---
layout: project
slug: chzzk-songs
title: chzzk_songs
subtitle: 치지직 스트리머 노래 클립 아카이브
status: 운영 중 / Self-hosted
order: 2
tech: [TypeScript, Hono, Drizzle ORM, SQLite, React 19, TanStack Router, TanStack Query, Tailwind v4, Vite, Docker, Kubernetes (k3s), Helm, GitHub Actions, Cloudflare Access, Prometheus]
mermaid: true
links:
  - label: Live
    url: https://timoong.mangru.dev
  - label: GitHub
    url: https://github.com/studio-mangru/chzzk_songs
permalink: /portfolio/chzzk-songs/
lang: ko
page_id: project-chzzk-songs
---

치지직(Chzzk) 스트리머가 부른 노래 클립을 모아서, Spotify·YouTube의 원곡과 매칭해 보여주는 자체 호스팅 SPA입니다. 치지직 공식 API가 채널당 최근 50 + 인기 50개의 클립만 노출하는 제한이 있어, **Naver 검색 결과를 하베스팅**하는 보조 파이프라인으로 채널당 1,000개 이상의 과거 클립까지 백필합니다. Studio Mangru의 k3s 클러스터에서 운영 중이고, 코드는 GitHub에 공개되어 있습니다.

## 프로젝트 한눈에 보기

| 항목 | 값 |
| --- | --- |
| 백엔드 | Hono 4 + Drizzle ORM + better-sqlite3 + node-cron |
| 프런트엔드 | React 19 + Vite 8 + TanStack Router/Query + Tailwind v4 |
| 데이터 모델 | SQLite WAL, 10개 테이블 (streamers / clips / songs / clipSongs / tags / clipTags / syncLogs / songKeywords / songCandidates / reports) |
| 외부 API | Chzzk · Naver Open API · Spotify Web API · YouTube Data v3 |
| 인증 | 앞단 Cloudflare Access (zero-trust 게이트) + 앱 내부 JWT (관리자) + 부팅 단계 시크릿 강도 검증 |
| 배포 | 멀티스테이지 Docker → 자체 registry → k3s + Helm (GitHub Actions가 helm upgrade까지) |
| 관측 | Prometheus 메트릭 + ServiceMonitor + Grafana 대시보드 ConfigMap |

## 시스템 구성

세 가지 데이터 소스가 들어오고, 한 곳에 정렬된 다음, 한 곳에서 서빙되는 단순한 형태입니다. 다이어그램은 데이터의 흐름만 보여줍니다.

<div class="mermaid" markdown="0">
flowchart LR
  subgraph EXT["External"]
    Chzzk["Chzzk API<br/>(recent 50 + popular 50)"]
    Naver["Naver Search<br/>(Open API + XHR)"]
    Spotify["Spotify Web API"]
    YouTube["YouTube Data v3"]
  end

  subgraph BE["Backend (Hono)"]
    Cron["node-cron · 6h"]
    Harvest["Naver Harvest<br/>backfill 1,000+"]
    API["REST API<br/>/api/clips · /api/songs · /api/admin/*"]
    Metrics["Prometheus<br/>middleware"]
  end

  SQLite[("SQLite WAL<br/>10 tables")]

  subgraph FE["Frontend (React + Vite)"]
    Routes["TanStack Router"]
    Query["TanStack Query"]
    Bookmark["IndexedDB Bookmarks"]
  end

  K3s["k3s + Helm<br/>GitHub Actions deploy"]
  Grafana["Grafana<br/>dashboard"]

  Cron --> Chzzk
  Cron --> Harvest
  Harvest --> Naver
  API --> Spotify
  API --> YouTube
  Chzzk --> API
  Harvest --> SQLite
  API --> SQLite
  Routes --> Query
  Query -->|/api| API
  Routes --> Bookmark
  Metrics -.->|/metrics| Grafana
  K3s -.->|deploys| API
</div>

## Naver 하베스팅: API 한계를 우회하는 듀얼 소스

치지직 공식 API는 "최근 50 + 인기 50"만 줍니다. 같은 스트리머의 1년 전 클립은 그쪽으로 못 받습니다. 대신 **Naver 검색 결과에서 클립 UID를 긁어와 Chzzk 상세 API로 메타데이터를 보강**하는 두 번째 파이프라인을 만들었습니다. 핵심 위험은 "다른 채널의 클립이 섞여 들어오는 것"인데, Chzzk 상세 응답의 `ownerChannelId`로 사후 필터링해서 차단합니다.

```ts
// packages/backend/src/services/naverHarvest.ts
const uids = await harvestClipUIDs(streamer.name);             // Naver에서 UID만 긁기
const newUIDs = uids.filter((u) => !existingIds.has(u));        // DB에 없는 것만
const details = await fetchInBatches(                            // 동시성 4 / 150ms delay로
  newUIDs, (uid) => getClipFullDetail(uid), 4, 150);             // Chzzk 부하 보호

for (let i = 0; i < newUIDs.length; i++) {
  const detail = details[i];
  if (!detail) { result.skippedUnreachable++; continue; }

  // 사후 필터: 다른 채널의 클립이면 버림 (검색은 부정확하므로 권위 검증)
  if (detail.ownerChannelId && detail.ownerChannelId !== streamer.channelId) {
    result.skippedWrongOwner++;
    continue;
  }

  // 카테고리 + 키워드로 노래 후보 자동 분류 (관리자가 최종 결정)
  const isSongCandidate =
    detail.clipCategory === "music" &&
    keywordList.some((kw) => detail.clipTitle.toLowerCase().includes(kw));

  await db.insert(clips).values({ /* ... */ status: isSongCandidate ? "song_candidate" : "pending" });
}
```

배치 사이에 150ms를 끼워 넣고 동시성 4로 묶은 건 단순한 매너 코드이기도 하고, Chzzk public API가 갑자기 차단되지 않게 하는 보호선이기도 합니다.

## 보안: 두 층의 게이트 + 부팅 실패로 약한 시크릿 차단

관리자 라우트 앞단에는 **Cloudflare Access (zero-trust)** 를 둬서 IdP 인증을 통과하지 못한 요청은 애초에 앱까지 도달하지 못합니다. 그 안쪽에서 **JWT 관리자 토큰**으로 한 번 더 게이트하는 두 층 구조입니다. 외곽에서 신원을 확인하고, 내부에서 권한을 확인하는 역할 분담입니다.

여기에 더해, 약한 시크릿이 운영에 흘러들어가는 사고를 막기 위해 환경변수 자체를 부팅 단계에서 검증합니다. 이전 코드에는 `process.env.JWT_SECRET || "dev-secret-change-in-production"` 같은 패턴이 있었습니다. .env 한 줄을 빼먹으면 누구나 코드만 보고 `dev-secret-...`로 admin 토큰을 위조할 수 있는 구조였죠. **import 시점에 throw**해서 pod를 CrashLoop 시키는 헬퍼로 바꿨습니다 — silent degradation을 사고로 만드는 패턴입니다.

```ts
// packages/backend/src/lib/env.ts (요지)
const KNOWN_PLACEHOLDERS = new Set([
  "admin", "password", "secret", "test",
  "change-me", "changeme", "dev-secret",
  "dev-secret-change-in-production",
  "your-jwt-secret-key", /* ... */
]);

export function requireEnv(name: string, minLength = 16): string {
  const v = process.env[name];
  if (!v)                          throw new Error(`${name} is required.`);
  if (v.length < minLength)        throw new Error(`${name} must be ≥ ${minLength} chars (got ${v.length}).`);
  if (KNOWN_PLACEHOLDERS.has(v.toLowerCase()) || /^(change[-_]?me|your[-_])/i.test(v)) {
    throw new Error(`${name} looks like a placeholder. Use a real secret.`);
  }
  return v;
}

// 사용처: import 시점에 평가되므로, 약한 값이면 부팅 자체가 막힘
const JWT_SECRET = requireEnv("JWT_SECRET", 32);
```

운영 환경에서 가장 무서운 건 "약한 값으로 조용히 잘 도는 상태"입니다. 이건 차라리 안 돌게 만드는 쪽이 안전합니다.

## 관측: 카디널리티를 의식한 메트릭 설계

`prom-client`로 HTTP 응답 시간 히스토그램을 노출합니다. 라벨을 잘못 골랐다가는 시계열이 폭발하기 때문에 셋만 골랐습니다 — `method` / `route` / `status_class`. 상태코드는 5xx/4xx 클래스로만 묶었고(라우트당 시리즈 약 5배 감소), 라우트는 raw URL이 아니라 Hono의 매칭된 **템플릿 경로**(`/api/clips/:id`)를 사용해 카디널리티를 카드 수에 비례하도록 제한했습니다.

```ts
// packages/backend/src/lib/metrics.ts
export const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds, partitioned by method/route/status_class.",
  labelNames: ["method", "route", "status_class"],  // status_code (X) → status_class (O)
  registers: [register],
});

// /metrics 자체와 /api/health는 인스트루먼트에서 제외:
// - /metrics 가 자기 자신을 측정하면 self-inflation
// - /api/health 는 k8s probe가 초당 호출 → 의미 없는 노이즈 + p95 왜곡
const SKIP_PATHS = new Set(["/metrics", "/api/health"]);
```

Helm 차트에 `ServiceMonitor`를 함께 넣어서, Prometheus Operator가 새 pod를 알아서 잡아가고, Grafana 대시보드는 ConfigMap sidecar로 자동 로드됩니다.

## 프런트: IndexedDB 북마크 + 탭 간 동기화

북마크는 사용자의 로컬 데이터라 서버에 보낼 이유가 없습니다. localStorage로도 충분하긴 하지만 향후 메모·라벨 등 메타데이터가 붙을 수 있어 처음부터 **IndexedDB**로 깔았습니다. 탭 두 개를 켜놓고 한쪽에서 북마크를 토글하면 다른 쪽도 즉시 반응하도록, **`storage` 이벤트**를 깨우는 작은 패턴을 끼워 넣었습니다.

```ts
// packages/frontend/src/lib/bookmarks.ts (요지)
const BOOKMARK_CHANGE = "chzzk-bookmark-change";

function poke() {
  // 같은 탭은 CustomEvent로,
  window.dispatchEvent(new CustomEvent(BOOKMARK_CHANGE));
  // 다른 탭은 localStorage 키를 한 번 갱신해서 storage 이벤트로 전파
  try { localStorage.setItem("chzzk_bookmark_tick", String(Date.now())); } catch {}
}

export function onBookmarksChanged(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(BOOKMARK_CHANGE, handler);
  window.addEventListener("storage", handler);           // 탭 간 동기화의 핵심
  return () => {
    window.removeEventListener(BOOKMARK_CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}
```

## 배포: GitHub Actions → 자체 registry → k3s

`main` 브랜치에 푸시가 들어오면 GitHub Actions가:

1. 멀티스테이지 Docker 이미지 빌드 (프런트 정적 자산을 백엔드 dist에 같이 굽기)
2. Tailscale 안쪽의 자체 컨테이너 레지스트리(`registry.mangru.dev`)에 푸시
3. `helm upgrade --install` 로 k3s 클러스터에 롤아웃

까지 자동으로 이어집니다. 별도 운영자 개입 없이, 머지가 곧 배포입니다.

## 의식적으로 한 결정들

- **DB는 SQLite + WAL** — 단일 노드에서 운영 중이고 데이터가 압도적으로 read-heavy. Postgres 추가 운영 부담을 굳이 떠안지 않았습니다.
- **외부 API는 graceful degradation** — Spotify·YouTube·Naver 키가 없어도 Chzzk 코어 기능은 계속 동작합니다. 보조 매칭만 비활성화되는 형태.
- **메트릭은 운영 첫날부터** — Phase 1에서 메트릭·대시보드·ServiceMonitor를 같이 넣었습니다. 늦게 붙이면 "왜 느려졌지"의 답을 못 찾습니다.

## 직접 사용해보기

위의 **Live** 버튼으로 운영 중인 사이트에 바로 접속할 수 있고, 전체 소스와 Helm 차트, GitHub Actions 워크플로우는 **GitHub**에서 확인할 수 있습니다.
