---
layout: project
slug: chap-sticky
title: 찹! 찐득이 (Splat! Sticky)
subtitle: 엔진 없이 바닐라 JS로 만든 물리 미니게임
status: 출시 / Live
order: 3
image: /assets/portfolio/chap-sticky/itch_cover.png
image_alt: 찹! 찐득이 cover
tech: [JavaScript, HTML5 Canvas, WebAudio, Capacitor, GitHub Actions]
mermaid: true
links:
  - label: itch.io (플레이)
    url: https://rumaniel.itch.io/splat-sticky
  - label: GitHub
    url: https://github.com/rumaniel/chap-sticky
permalink: /portfolio/chap-sticky/
lang: ko
page_id: project-chap-sticky
---

끈적이 장난감을 벽에 **던져 붙이고**, 접착력이 닳아 서서히 굴러떨어질 때까지 버티는 물리 미니게임입니다. 점수는 매달린 시간 × 과녁 링 배수. 던지면서 스핀을 주면 **마그누스 효과**로 공이 휘어집니다. **엔진도 라이브러리도 에셋 파일도 없이** — 바닐라 JavaScript + HTML5 Canvas, 그래픽은 코드로 그리고 사운드는 WebAudio로 합성합니다. 2026 미니게임 메이커스 챌린지 출품작이고, itch.io와 Google Play(내부)에 출시했습니다.

## 프로젝트 한눈에 보기

| 항목 | 값 |
| --- | --- |
| 엔진 | 없음 — 바닐라 JavaScript + HTML5 Canvas |
| 런타임 의존성 | 0개 (그래픽 코드 드로잉, 오디오 WebAudio 합성 → `file://` 더블클릭으로 실행) |
| 모듈 | 12개 JS 모듈, 의존성 순서로 로드 (순환 없음) |
| 모드 | Practice(5구 라운드 + localStorage 리더보드), Party(2~8인 핫시트) |
| 콘텐츠 | 토이 3종(사람/문어/별) · 벽 4종(분필/방/유리/냉장고) |
| 모바일 패키징 | Capacitor 8.5 → Android AAB |
| 배포 | 태그 기반 GitHub Actions → itch.io(butler) + Google Play(내부) · v1.0.1 |

## 아키텍처

12개 JS 모듈을 **의존 방향 한 방향**으로만 쌓았습니다(아래가 위를 호출, 순환 없음). 빌드 스텝 없이 `<script>` 태그로 `window.ST` 네임스페이스에 순서대로 올립니다. 게임 흐름은 **두 개의 상태기계**로 갈립니다 — 던지기 전체 흐름(idle→aim→fly→…)과, 벽에 붙은 뒤의 접착 단계(settle→hold⇄roll→peel→fall).

<div class="mermaid" markdown="0">
flowchart TD
  subgraph LOAD["모듈 로드 순서 (의존성 하→상)"]
    direction LR
    i18n --> shapes --> materials --> audio --> score --> physics --> input --> sticky --> ui --> modes --> main
  end

  subgraph GSM["Game 상태기계 (main.js)"]
    direction LR
    idle --> aim --> fly
    fly --> stuck
    fly --> bounceoff
    fly --> fall
    stuck --> done
    bounceoff --> done
    fall --> done
  end

  subgraph SSM["Sticky 단계기계 (sticky.js)"]
    direction LR
    settle --> hold
    hold --> roll
    roll --> hold
    hold --> peel --> fallS["fall"]
  end
</div>

좌표계는 4개를 구분해 씁니다 — 월드(미터), 벽 정규화, 480×800 가상 스크린, 셰이프 로컬. 해상도·종횡비가 달라도 물리는 월드 좌표에서만 돌고, 렌더만 가상 스크린으로 투영합니다.

## 결정론적 물리: 60/90/120/144Hz 어디서든 같은 착탄

물리 미니게임의 핵심 요구는 **"같은 던지기는 항상 같은 곳에 닿는다"**입니다. 프레임레이트나 히치에 따라 착탄점이 흔들리면 실력 게임이 운 게임이 됩니다. `stepFlight`는 프레임 시간을 누적해 **정확히 1/120초 스텝으로만 적분**하고, 벽면까지는 **선형 보간**해서 충돌 상태를 프레임 길이에서 분리합니다.

```js
// game/js/physics.js — 고정 타임스텝 누적기
f.acc = (f.acc || 0) + dt;
while (f.acc >= H_STEP - 1e-9) {
  f.acc -= H_STEP;
  const h = H_STEP;                            // 정확히 1/120s
  const px = f.x, pz = f.z;                     // 서브스텝 이전 상태 보관
  f.vy -= TUNE.GRAVITY * h;
  f.vx += TUNE.MAGNUS * f.spin * f.vz * h;      // 마그누스 커브
  f.spin *= 1 - TUNE.SPIN_DECAY * h;
  f.x += f.vx * h; f.y += f.vy * h; f.z += f.vz * h;

  if (f.z >= TUNE.WALL_Z) {
    // 벽면까지 보간 → 착탄 위치·속도가 프레임 길이와 무관해진다 (결정론)
    const u = f.z > pz ? (TUNE.WALL_Z - pz) / (f.z - pz) : 1;
    f.x = px + (f.x - px) * u;
    // … y / vx / vy / angle / spin 도 u 로 보간 …
  }
}
```

처음엔 스텝 수를 프레임에 비례시켰다가 "100ms 히치면 착탄이 2cm 이동해 유리창 창틀에서 튕기는" 버그가 났습니다. 적대적 리뷰(R15)가 이걸 재현했고, 고정 스텝 + 보간으로 바꾼 뒤 **60/90/120/144Hz 5,280 케이스에서 착탄 좌표 Δ=0**(비트 단위 동일)을 확인했습니다.

## 역진자 토플: 하강이 "물리로" 생긴다

붙은 장난감이 떨어지는 과정을, 애니메이션 커브가 아니라 **실제 회전**으로 만들었습니다. 아직 붙어 있는 패드를 피벗 삼아 역진자처럼 기울고, 기울수록 가속하며, 더 낮은 곳에 다시 붙습니다. "접착 여유(juice)"가 소모되는 게 눈에 보입니다.

```js
// game/js/sticky.js — _updateRoll (역진자 회전)
const acc = (9.8 / V2.ROLL_L) * Math.sin(Math.min(R.phi + R.nudge, Math.PI / 2));
R.vel += acc * dt;
let d = Math.min(0.3, R.vel * dt);              // 프레임당 회전 상한(안정성)
R.phi += d;

const a = d * R.dir;                            // 피벗 중심 실제 회전
const c = Math.cos(a), s = Math.sin(a);
const dx = st.x - R.pivot.x, dy = st.y - R.pivot.y;
st.x = R.pivot.x + dx * c + dy * s;
st.y = R.pivot.y - dx * s + dy * c;
st.angle += a;
```

여기에 **패드별 그립 모델**(결정적 기하 계수 + 품질 연동 지터 + hold-slip 이산 사건)을 얹어, 매 던지기마다 붕괴 순서가 달라집니다. 같은 벽 같은 토이라도 전개가 다르게 읽히는 이유입니다.

## 엔진도, 에셋도 없이

의도적으로 **런타임 의존성 0**으로 만들었습니다.

- **그래픽은 전부 코드 드로잉** — 토이 3종·벽 4종이 전부 Canvas 패스. 이미지 파일 0개.
- **사운드는 WebAudio 합성** — 오디오 파일 0개. 저작권 클린, 용량 거의 0.
- **빌드 스텝 없음** — `game/index.html`을 더블클릭하면 `file://`에서도 그대로 돕니다.

용량과 저작권 리스크를 0으로 만드는 동시에, 모바일은 Capacitor로 감싸 AAB만 뽑으면 돼서 파이프라인이 단순합니다.

## 스크린샷

![던지기 조준](/assets/portfolio/chap-sticky/itch_s1_aim.png)

![마그누스 커브](/assets/portfolio/chap-sticky/itch_s3_curve.png)

![파티 모드 (동시 크롤)](/assets/portfolio/chap-sticky/itch_s4_party.png)

![유리벽](/assets/portfolio/chap-sticky/itch_s5_glass.png)

![플레이 루프](/assets/portfolio/chap-sticky/itch_play.gif)

## 배포

태그를 푸시하면 GitHub Actions가 (1) itch.io에 butler로 웹 빌드를 올리고, (2) Capacitor로 감싼 Android AAB를 Google Play 내부 트랙에 올립니다. 웹과 모바일이 **같은 바닐라 JS 코어**를 공유하므로, 포팅 비용 없이 한 코드베이스로 두 플랫폼을 냅니다.

## 의식적으로 한 결정들

- **엔진을 안 쓴다** — 미니게임 한 판에 Unity/Godot 런타임은 과합니다. 즉시 로드·저작권 클린·극소 용량을 얻는 대신, 물리·렌더·오디오를 직접 짰습니다.
- **물리는 결정론 최우선** — 실력 게임이려면 프레임레이트 독립이 필수. 고정 타임스텝 + 보간으로 비트 단위 재현성을 확보했습니다.
- **적대적 리뷰 루프** — 밸런스·결정론 버그를 R9–R16 리뷰 라운드로 반복해서 재현·수정했습니다. 커밋 이력에 그 흔적이 남아 있습니다.

## 직접 플레이해보기

위의 **itch.io** 버튼으로 브라우저에서 바로 플레이할 수 있고, 전체 소스는 **GitHub**에 공개되어 있습니다.
