---
layout: project
slug: solitaire
title: Solitaire
subtitle: Unity로 만든 클래식 카드 게임
status: 서비스 중
order: 1
image: /assets/portfolio/solitaire/feature-graphic.png
image_alt: Solitaire feature graphic
tech: [Unity 6.3 LTS, C#, VContainer, R3, UniTask, MemoryPack, Addressables, GitHub Actions]
mermaid: true
links:
  - label: Google Play
    url: https://play.google.com/store/apps/details?id=com.mangru.solitaire
  - label: itch.io
    url: https://rumaniel.itch.io/solitaire-tower
  - label: GitHub
    url: https://github.com/rumaniel/solitaire
permalink: /portfolio/solitaire/
lang: ko
page_id: project-solitaire
---

클론다이크/이스트헤이븐 룰을 지원하는 모바일 솔리테어 게임이며, **Clean Architecture를 어셈블리(asmdef) 경계로 강제**해서 도메인 로직을 Unity 의존성과 완전히 분리한 것이 핵심 설계입니다. 출시는 Google Play와 itch.io에 진행되어 있고, 셔플 시드·힌트 정렬·자동승 판정 같은 게임 핵심 로직은 순수 C#으로 분리되어 NUnit 단위 테스트로 검증됩니다.

## 프로젝트 한눈에 보기

| 항목 | 값 |
| --- | --- |
| 런타임 어셈블리 | 9개 (App · Scene · Component · Service · Gateway · Core · Data · Model · Shared) |
| 비즈니스 서비스 | 9개 (Game / Card / Hint / Audio / Route / User / Stats / Snapshot 등) |
| EditMode 테스트 | 41 파일 (도메인·서비스·게이트웨이) |
| 지원 룰 | 클론다이크, 이스트헤이븐 |
| 플랫폼 | Android (Google Play), Web (itch.io) |
| CI/CD | GitHub Actions(self-hosted macOS) → EditMode 테스트 → AAB 서명 → Play Console 업로드 |

## 아키텍처

asmdef 9개를 레이어로 묶어 의존 방향을 한 방향으로 못 박았습니다. **Model은 Unity 어셈블리를 일절 참조하지 않으며**, 그 덕분에 도메인 로직이 NUnit 한 줄로 검증됩니다. 모든 외부 I/O(저장소, Firebase, Play Games)는 Gateway에서 끝나고, 비즈니스 로직은 Service에서 끝나며, MonoBehaviour는 Component/Scene 레이어에만 존재합니다.

<div class="mermaid" markdown="0">
graph TD
  App["<b>App</b><br/>Composition Root<br/>VContainer LifetimeScope"]
  Scene["<b>Scene</b><br/>MVP Presenters<br/>(Login · Lobby · Ingame)"]
  Component["<b>Component</b><br/>UI · MonoBehaviour Views"]
  Service["<b>Service</b><br/>9개 비즈니스 서비스"]
  Gateway["<b>Gateway</b><br/>외부 I/O · 영속 계층"]
  Core["<b>Core</b><br/>Base Classes"]
  Data["<b>Data</b><br/>ScriptableObject Configs"]
  Model["<b>Model</b><br/>순수 도메인 — Unity 의존 0"]
  Shared["<b>Shared</b><br/>Utilities"]

  App --> Scene
  App --> Service
  App --> Gateway
  App --> Component
  Scene --> Component
  Scene --> Service
  Scene --> Gateway
  Component --> Service
  Component --> Gateway
  Component --> Core
  Service --> Gateway
  Service --> Data
  Service --> Model
  Service --> Core
  Gateway --> Model
  Gateway --> Data
  Data --> Model
  Core --> Shared
</div>

### 레이어별 책임

- **App** — VContainer `LifetimeScope` 하나가 전체 의존성 그래프를 조립합니다. 부트스트랩 외 로직 없음.
- **Scene** — Login / Lobby / Ingame을 MVP로 분리. 프레젠터가 Service에 명령을 보내고, R3 스트림으로 모델 변화를 구독합니다.
- **Component** — 카드 드래그·앵커·이펙트 같은 시각 요소만. 도메인 결정을 내리지 않습니다.
- **Service** — 게임 규칙, 힌트, 자동승, 통계, 오디오 등 9개 서비스. 외부 의존이 필요한 경우 Gateway 인터페이스에만 의존.
- **Gateway** — Firebase, Google Play Games, 로컬 스냅샷 등 외부와 닿는 모든 코드의 경계.
- **Model** — `PlayingCard`, `PileState`, `TableState` 등의 순수 도메인 타입. **`UnityEngine` 참조 0건**.
- **Data** — 룰셋, 점수표 등을 ScriptableObject로 표현. 콘텐츠 튜닝을 코드 빌드 없이 가능하게 합니다.

## 순수 도메인 모델

가장 안쪽 어셈블리인 `Model`은 Unity를 모릅니다. 모든 카드/파일/테이블 상태가 값 객체로 표현되며, `IEquatable<T>`/`GetHashCode` 구현으로 컬렉션·테스트에서 자연스럽게 동작합니다.

```csharp
// Model/Card/PlayingCard.cs
namespace Model.Card
{
    /// <summary>
    /// Pure domain model representing a playing card without Unity dependencies.
    /// </summary>
    public class PlayingCard : IEquatable<PlayingCard>
    {
        public Rank Rank { get; private set; }
        public Suit Suit { get; private set; }

        public PlayingCard(Rank rank, Suit suit)
        {
            Rank = rank;
            Suit = suit;
        }

        public bool Equals(PlayingCard other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            return Rank == other.Rank && Suit == other.Suit;
        }

        public override int GetHashCode() => HashCode.Combine(Rank, Suit);
    }
}
```

## 게임 상태는 불변 객체로

파일(pile) 한 줄의 상태는 외부에서 수정할 수 없게 `IReadOnlyList`로 노출하고, 보드 질의(어디까지 뒤집혔는가 등)는 도메인 메서드 안으로 옮겨 클라이언트가 같은 규칙을 다시 만들지 않도록 합니다.

```csharp
// Model/Game/PileState.cs (요지)
public class PileState : IEquatable<PileState>
{
    public PileId Id { get; }
    public IReadOnlyList<PlayingCard> Cards { get; }
    public int FaceUpFromIndex { get; }

    public PileState(PileId id, List<PlayingCard> cards, int faceUpFromIndex)
    {
        if (cards == null) throw new ArgumentNullException(nameof(cards));
        Id = id;
        Cards = cards.AsReadOnly();
        FaceUpFromIndex = faceUpFromIndex;
    }

    public bool IsFaceUp(int index) => index >= FaceUpFromIndex;
}
```

## 결정론적 힌트: stable sort로 같은 보드 = 같은 추천

힌트는 단순히 “둘 곳 있는 카드”를 보여주는 게 아닙니다. **같은 보드 상태에서는 항상 같은 순서로 같은 수**를 추천해야 플레이어 학습이 가능하고, 자동 테스트도 가능합니다. 이를 위해 7단계 비교 키로 완전한 전체 순서(strict total ordering)를 정의합니다.

```csharp
// Service/HintService/HintService.cs
public IReadOnlyList<HintMove> GetHints(TableState state)
{
    var moves = MoveEnumerator.FindAllMoves(state, cardService, dealRule);
    // Strict total ordering — deterministic across platforms/runs
    moves.Sort((a, b) =>
    {
        int cmp = b.Priority.CompareTo(a.Priority);                            if (cmp != 0) return cmp;
        cmp = ((int)a.MoveType).CompareTo((int)b.MoveType);                    if (cmp != 0) return cmp;
        cmp = ((int)a.Request.SourcePileId.Type).CompareTo((int)b.Request.SourcePileId.Type); if (cmp != 0) return cmp;
        cmp = a.Request.SourcePileId.Index.CompareTo(b.Request.SourcePileId.Index);            if (cmp != 0) return cmp;
        cmp = a.Request.SourceIndex.CompareTo(b.Request.SourceIndex);                          if (cmp != 0) return cmp;
        cmp = ((int)a.Request.TargetPileId.Type).CompareTo((int)b.Request.TargetPileId.Type);  if (cmp != 0) return cmp;
        return a.Request.TargetPileId.Index.CompareTo(b.Request.TargetPileId.Index);
    });
    return moves;
}
```

플랫폼·런타임이 바뀌어도 같은 추천을 보장하기 때문에, 골든 파일 기반 NUnit 테스트가 그대로 작동합니다.

## 셔플: 재현 가능 + 충분한 엔트로피

“리플레이 가능한 게임” 요구사항과 “예측 불가능한 첫 덱” 요구사항을 동시에 만족시키기 위해, **셔플은 시드 기반 Fisher–Yates**, **시드 자체는 암호학적 RNG**로 분리했습니다.

```csharp
// Service/GameService/DeckFactory.cs
public static List<PlayingCard> CreateShuffled(int seed)
{
    var deck = CreateOrdered();
    var rng = new Random(seed);
    for (int i = deck.Count - 1; i > 0; i--)
    {
        int j = rng.Next(i + 1);
        (deck[i], deck[j]) = (deck[j], deck[i]);
    }
    return deck;
}

public static int CreateRandomSeed()
{
    var bytes = new byte[4];
    using var rng = RandomNumberGenerator.Create();
    rng.GetBytes(bytes);
    return BitConverter.ToInt32(bytes, 0);
}
```

덕분에 (a) 같은 시드를 저장하면 똑같은 판을 재생할 수 있고, (b) 시드 자체는 `System.Random`이 아닌 `RandomNumberGenerator`로 만들어 단조 패턴이 생기지 않습니다.

## 성능: 무용한 수 가지치기

힌트 탐색은 모든 가능한 이동을 후보로 만들지만, “킹을 빈 자리로 옮기기”처럼 보드를 진척시키지 못하는 수는 잘라냅니다. 분기점 하나하나가 모바일 프레임 예산을 갉아먹기 때문에, 의미 있는 수만 남도록 도메인 지식으로 필터링했습니다.

```csharp
// Service/HintService/MoveEnumerator.cs
private static bool IsUselessKingMove(PileState source, int sourceIndex, PileState target)
{
    if (target.Cards.Count > 0) return false;                          // 빈 자리로의 이동만 대상
    if (source.Cards[sourceIndex].Rank != Rank.King) return false;     // 킹이 아니면 통과
    if (sourceIndex != source.FaceUpFromIndex) return false;           // 면이 꺾이는 위치만
    if (sourceIndex > 0) return false;                                 // 아래에 뒷면이 있으면 reveal — 의미 있음
    return true;                                                       // 전부 만족 → 무의미한 재배치
}
```

탐색 자체도 “먼저 가장 싼 검사부터”라는 원칙으로 짜여 있어서, 평균적으로 첫 번째 유효 수가 발견되는 즉시 단락(short-circuit) 됩니다.

## 스크린샷

![로비 화면](/assets/portfolio/solitaire/screenshots/01-lobby.png)

![인게임 진행](/assets/portfolio/solitaire/screenshots/02-midgame.png)

![힌트 표시](/assets/portfolio/solitaire/screenshots/04-hint.png)

![승리 패널](/assets/portfolio/solitaire/screenshots/06-win-panel.png)

![통계 화면](/assets/portfolio/solitaire/screenshots/07-stats.png)

## 테스트 & CI/CD

- **EditMode 단위 테스트 41 파일** — 셔플 분포, 합법 수 판정, 힌트 정렬, 자동승 판정, 점수 계산, 통계 누적 등 도메인·서비스 계층을 NUnit으로 검증합니다.
- **GitHub Actions (self-hosted macOS)** — 모든 PR에서 EditMode 테스트와 Android 빌드 검증을 게이트로 걸어두고, main 머지 시 AAB 서명·Play Console 업로드까지 자동화했습니다.
- **릴리스 노트 자동 생성** — 머지된 PR 메시지에서 changelog를 만들어 Play Console에 업로드해, 빌드 추적과 릴리스 메모를 코드 변화와 일치시켰습니다.

## 설계에서 의식적으로 한 선택들

- **핵심 게임 로직은 동기/순수 C#** — 차례 기반 카드 게임은 비동기를 강제할 이유가 없습니다. R3·UniTask는 UI·네트워크·저장소 같은 경계 계층에서만 쓰고, 보드 로직은 동기적으로 유지해 재현성과 디버깅 가능성을 확보했습니다.
- **컨텐츠는 데이터, 규칙은 코드** — 룰셋이나 점수표는 ScriptableObject(Data)로, 규칙 해석은 Service의 Strategy 구현으로 분리되어 있어, 디자이너가 코드 빌드 없이 튜닝할 수 있습니다.
- **DI는 LifetimeScope 하나** — VContainer 스코프를 잘게 나누지 않고 App 한 군데에서만 묶었습니다. 게임 규모상 그 이상은 복잡성만 추가합니다.

## 직접 플레이해보기

위의 **Google Play** / **itch.io** 버튼으로 설치·플레이할 수 있고, 전체 소스는 **GitHub**에서 공개되어 있습니다.
