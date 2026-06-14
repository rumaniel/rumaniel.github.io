---
layout: project
slug: solitaire
title: Solitaire
subtitle: Unity로 만든 클래식 카드 게임
status: 서비스 중
order: 1
image: /assets/portfolio/solitaire/feature-graphic.png
image_alt: Solitaire feature graphic
tech: [Unity 6.3 LTS, C#, VContainer, R3, UniTask, MemoryPack, Addressables, Google Play Games, Firebase, Unity Adaptive Performance, GitHub Actions]
links:
  - label: Google Play
    url: https://play.google.com/store/apps/details?id=com.mangru.solitaire
  - label: itch.io
    url: https://rumaniel.itch.io/solitaire-tower
  - label: GitHub
    url: https://github.com/rumaniel/solitaire-portfolio
permalink: /portfolio/solitaire/
lang: ko
page_id: project-solitaire
---

5종의 게임 모드(클론다이크 · 이스트헤이븐 · 스파이더 · 피라미드 · 트라이픽스)를 지원하는 모바일 솔리테어 게임이며, **Clean Architecture를 어셈블리(asmdef) 경계로 강제**해서 도메인 로직을 Unity 의존성과 완전히 분리한 것이 핵심 설계입니다. 단일 솔리테어에서 시작해 파일 기반(클론다이크/이스트헤이븐/스파이더)과 보드 기반(피라미드/트라이픽스)을 모두 품는 멀티 변형 플랫폼으로 확장됐습니다. Google Play와 itch.io에 출시되어 있고, 셔플 시드·힌트 정렬·자동승 판정·솔버 같은 핵심 로직은 순수 C#으로 분리되어 NUnit 단위 테스트로 검증됩니다.

## 프로젝트 한눈에 보기

| 항목 | 값 |
| --- | --- |
| 게임 모드 | 5종 (클론다이크 · 이스트헤이븐 · 스파이더 · 피라미드 · 트라이픽스) |
| 런타임 어셈블리 | 11개 자체 코드 + Firebase · Play Games 벤더 플러그인 |
| 비즈니스 서비스 | 16개 (Game / Board / Card / Hint / Audio / Route / User / Stats / Snapshot / Skin / Layout / Daily / Achievement / Consent / Haptic / Localization) |
| EditMode 테스트 | 60+ 파일 (도메인·서비스·게이트웨이·솔버) |
| 플랫폼 연동 | Google Play Games (업적), Firebase, Unity Adaptive Performance |
| 플랫폼 | Android (Google Play), Web (itch.io) |
| CI/CD | GitHub Actions(self-hosted macOS) → EditMode 테스트 → AAB 서명 → Play Console / itch.io 업로드 · Gemini 자동화 |

## 아키텍처

asmdef를 레이어로 묶어 의존 방향을 한 방향으로 못 박았습니다. **Model은 Unity 어셈블리를 일절 참조하지 않으며**, 그 덕분에 도메인 로직이 NUnit 한 줄로 검증됩니다. 모든 외부 I/O(저장소, Firebase, Play Games)는 Gateway에서 끝나고, 비즈니스 로직은 Service에서 끝나며, MonoBehaviour는 Component/Scene 레이어에만 존재합니다. 게임 모드가 5종으로 늘어난 뒤에도 이 경계 덕에 변형마다 코드가 섞이지 않습니다 — 하나의 Ingame 씬이 모든 모드를 호스팅하고, 모드별 규칙은 Service의 Strategy 구현으로 갈립니다.

{% include architecture-onion.html lang="ko" %}

### 레이어별 책임

- **App** — VContainer `LifetimeScope` 하나가 전체 의존성 그래프를 조립합니다. 부트스트랩 외 로직 없음.
- **Scene** — Login / Lobby / Ingame을 MVP로 분리. 프레젠터가 Service에 명령을 보내고, R3 스트림으로 모델 변화를 구독합니다.
- **Component** — 카드 드래그·앵커·이펙트 같은 시각 요소만. 도메인 결정을 내리지 않습니다.
- **Service** — 게임 규칙, 힌트, 자동승, 통계, 오디오, 업적, 동의, 햅틱, 로컬라이즈 등 16개 서비스. 외부 의존이 필요한 경우 Gateway 인터페이스에만 의존.
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

## 5종 모드 + 솔버: "풀 수 있는 판"만 배포

게임 모드를 클론다이크에서 다섯으로 늘리면서 핵심 원칙 하나를 지켰습니다 — **각 모드의 규칙은 Service의 독립 Strategy로만 존재하고, 보드 표현은 Model의 순수 타입으로 공유**합니다. 그래서 파일 기반(클론다이크/이스트헤이븐/스파이더)과 보드 기반(피라미드/트라이픽스)이 한 코드베이스에 공존하면서도 서로의 규칙을 모릅니다.

모드별로 **솔버**를 붙여, 배포되는 시드가 실제로 풀 수 있는 판인지 검증합니다. "운이 없어서 못 깨는 판"을 사용자에게 주지 않기 위해, Daily 챌린지 시드는 솔버를 통과한 것만 frozen 상태로 고정해 배포합니다. 솔버·스코어러·레이아웃 팩토리·매치 규칙은 모두 모드별 NUnit 테스트로 검증됩니다(예: `TriPeaksSolverTests`, `PyramidScorerTests`, `SpiderGameServiceTests`).

## Addressables: 선택 자산을 Gateway 뒤로 숨기기

카드 스킨과 다국어 문자열 테이블처럼 **선택적·언어별로만 필요한 자산**은 처음부터 메모리에 들고 있을 이유가 없습니다. Addressables(2.4)로 자산 그룹을 도메인 단위로 쪼개고, 게임 코드는 그 위에 얇은 Gateway 인터페이스만 쓰게 했습니다.

### 자산 그룹 분리

도메인이 다른 자산을 한 번들에 묶지 않은 덕에, 사용자가 한 가지 스킨만 적용할 때 다른 스킨을 로드하지 않습니다. 로케일도 같은 방식 — 한국어 사용자가 영어 테이블을 메모리에 들고 있을 이유가 없습니다.

- **Skins** — 카드 스프라이트 셋(`skin/classic`, `skin/plain`) · 라벨 `skin`
- **Localization-Locales** — 영어 · 한국어 · Pseudo
- **Localization-String-Tables-English / -Korean** — UI · Achievements · Share 테이블. 부팅 직후 필요한 것에는 `Preload` 라벨로 동시 선로드
- **Localization-Assets-Shared** — 전 언어 공유 폰트 · 텍스처
- **Default Local Group** — 폴백

### 게임 코드는 Gateway만 본다

`AssetReferenceT<CardSpriteSet>`를 인스펙터에서 지정해 두고, **Addressables의 모든 API를 게이트웨이가 흡수**합니다. Service 레이어는 `LoadAsync(reference) / Release(reference)` 두 개만 봅니다.

```csharp
// Gateway/Skin/AddressableSkinAssetGateway.cs
public class AddressableSkinAssetGateway : ISkinAssetGateway
{
    private readonly Dictionary<CardSpriteSetReference,
        AsyncOperationHandle<CardSpriteSet>> handles = new();

    public async UniTask<CardSpriteSet> LoadAsync(CardSpriteSetReference reference)
    {
        // 같은 reference에 대한 중복 호출은 진행 중인 핸들을 공유한다.
        // LoadAssetAsync의 "already loaded" 에러도 막고,
        // 미완료 시점에 reference.Asset(null)이 노출되는 사고도 막는다.
        if (handles.TryGetValue(reference, out var existing))
            return await existing.ToUniTask();

        var handle = reference.LoadAssetAsync<CardSpriteSet>();
        handles[reference] = handle;
        try
        {
            return await handle.ToUniTask();
        }
        catch
        {
            // 실패 시엔 캐시 항목과 내부 핸들을 같이 푼다.
            // 그래야 재시도가 반쯤 로드된 상태에 막히지 않는다.
            handles.Remove(reference);
            reference.ReleaseAsset();
            throw;
        }
    }

    public void Release(CardSpriteSetReference reference)
    {
        if (!handles.Remove(reference)) return;
        reference.ReleaseAsset();
    }
}
```

세 가지 디테일이 들어 있습니다:

- **In-flight 핸들 공유** — 같은 자산에 대한 동시 요청이 와도 하나의 핸들만 발급. 두 번 `LoadAssetAsync`로 메모리 누수나 "already loaded" 에러를 만들지 않습니다.
- **실패 시 자체 정리** — `catch`에서 캐시와 내부 핸들을 같이 풀어, 재시도가 깨끗한 상태에서 다시 시작합니다.
- **명시적 Release** — Service 레이어가 스킨을 바꿀 때 이전 스킨을 명시적으로 풀어야 자산이 GC됩니다. Addressables는 참조 카운트 기반이라 이걸 잊으면 그대로 누수입니다.

### 로컬라이즈도 같은 길로

`com.unity.localization`이 내부적으로 String Table을 Addressables로 가져오도록 설정돼 있어, 같은 라이프사이클을 공유합니다. `Preload` 라벨이 붙은 테이블만 부팅 시 함께 로드되고, Achievements 같은 보조 화면용 테이블은 처음 진입할 때 비로소 가져오는 구조라 초기 메모리와 시작 시간 둘 다 줄어듭니다.

### 지금은 로컬 번들, 인터페이스는 원격 전환에 열려 있음

현재는 **앱에 함께 들고 가는 로컬 번들**만 운영합니다. 원격 CDN 분리는 콘텐츠 업데이트 주기가 그 비용을 넘어설 때로 미뤄둔 상태입니다. 다만 게임 코드가 보는 인터페이스가 Gateway이지 Addressables가 아니라, 전환 시에도 호출부 변경 없이 가능합니다.

## 스크린샷

![로비 화면](/assets/portfolio/solitaire/screenshots/01-lobby.png)

![인게임 진행](/assets/portfolio/solitaire/screenshots/02-midgame.png)

![힌트 표시](/assets/portfolio/solitaire/screenshots/04-hint.png)

![승리 패널](/assets/portfolio/solitaire/screenshots/06-win-panel.png)

![통계 화면](/assets/portfolio/solitaire/screenshots/07-stats.png)

## 테스트 & CI/CD

- **EditMode 단위 테스트 60+ 파일** — 셔플 분포, 합법 수 판정, 힌트 정렬, 자동승 판정, 점수 계산, 통계 누적에 더해 모드별 솔버·스코어러·레이아웃·매치 규칙까지 도메인·서비스 계층을 NUnit으로 검증합니다.
- **GitHub Actions (self-hosted macOS)** — `test.yml`이 모든 PR에서 EditMode 테스트 + Android 빌드 검증을 게이트로 걸고, `release.yml`이 main 머지 시 AAB 서명·Play Console 내부 업로드와 itch.io(WebGL) butler 푸시까지 자동화합니다.
- **릴리스 노트 자동 생성** — Play Console API로 버전 코드를 조회하고, 머지된 PR에서 changelog를 만들어 빌드 추적과 릴리스 메모를 코드 변화와 일치시킵니다.
- **Gemini 기반 자동화** — PR 리뷰·이슈 트리아지 등을 보조하는 Gemini 워크플로우 5종을 CI에 두어, 반복적인 리뷰·분류 작업을 줄였습니다.

## 설계에서 의식적으로 한 선택들

- **핵심 게임 로직은 동기/순수 C#** — 차례 기반 카드 게임은 비동기를 강제할 이유가 없습니다. R3·UniTask는 UI·네트워크·저장소 같은 경계 계층에서만 쓰고, 보드 로직은 동기적으로 유지해 재현성과 디버깅 가능성을 확보했습니다.
- **컨텐츠는 데이터, 규칙은 코드** — 룰셋이나 점수표는 ScriptableObject(Data)로, 규칙 해석은 Service의 Strategy 구현으로 분리되어 있어, 디자이너가 코드 빌드 없이 튜닝할 수 있습니다.
- **DI는 LifetimeScope 하나** — VContainer 스코프를 잘게 나누지 않고 App 한 군데에서만 묶었습니다. 게임 규모상 그 이상은 복잡성만 추가합니다.

## 직접 플레이해보기

위의 **Google Play** / **itch.io** 버튼으로 설치·플레이할 수 있고, 전체 소스는 **GitHub**에서 공개되어 있습니다.
