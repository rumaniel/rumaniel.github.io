---
layout: project
slug: chzzk-songs
title: chzzk_songs
subtitle: Song-clip archive for Chzzk streamers
status: Live / Self-hosted
order: 2
tech: [TypeScript, Hono, Drizzle ORM, SQLite, React 19, TanStack Router, TanStack Query, Tailwind v4, Vite, Docker, Kubernetes (k3s), Helm, GitHub Actions, Cloudflare Access, Prometheus, Grafana, AlertManager, Cloudflare Web Analytics]
mermaid: true
links:
  - label: Live
    url: https://timoong.mangru.dev
  - label: GitHub
    url: https://github.com/studio-mangru/chzzk_songs
permalink: /portfolio/chzzk-songs/
lang: en
page_id: project-chzzk-songs
---

A self-hosted SPA that aggregates song clips from Chzzk streamers (a Korean streaming platform) and matches them with the original tracks on Spotify and YouTube. The official Chzzk API only exposes the 50 most recent and 50 most popular clips per channel, so I added a secondary pipeline that **harvests Naver search results** to backfill 1,000+ historical clips per channel. The site runs on Studio Mangru's k3s cluster, and the source is public on GitHub.

## At a glance

| Property | Value |
| --- | --- |
| Backend | Hono 4 + Drizzle ORM + better-sqlite3 + node-cron |
| Frontend | React 19 + Vite 8 + TanStack Router/Query + Tailwind v4 |
| Data model | SQLite WAL, 10 tables (streamers / clips / songs / clipSongs / tags / clipTags / syncLogs / songKeywords / songCandidates / reports) |
| External APIs | Chzzk · Naver Open API · Spotify Web API · YouTube Data v3 |
| Auth | Cloudflare Access (zero-trust gate) in front + in-app JWT (admin) + boot-time secret strength validation |
| Deployment | Multi-stage Docker → private registry → k3s + Helm (GitHub Actions all the way through `helm upgrade`) |
| Observability | Prometheus + ServiceMonitor + Grafana dashboard · PrometheusRule alerts → AlertManager → Discord · blackbox-exporter endpoint probes |
| Analytics | Cloudflare Web Analytics (cookie-less beacon) |

## System shape

Three sources flow in, land in one place, and are served from one place. The diagram only shows the data flow.

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

  subgraph OBS["Observability"]
    Prom["Prometheus"]
    Grafana["Grafana<br/>dashboard"]
    Alert["AlertManager<br/>→ Discord"]
    Blackbox["blackbox-exporter<br/>endpoint probes"]
  end

  CFA["Cloudflare<br/>Web Analytics"]

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
  Routes -.->|beacon| CFA
  Metrics -.->|/metrics| Prom
  Prom --> Grafana
  Prom --> Alert
  Blackbox --> Prom
  K3s -.->|deploys| API
</div>

## Naver harvesting — a dual source to dodge the API limit

The official Chzzk API gives you "recent 50 + popular 50." A streamer's clip from a year ago is just not reachable through it. So a second pipeline **scrapes UIDs from Naver search and hydrates them with the Chzzk detail API**. The chief risk — picking up clips from a different channel — is killed by post-filtering on `ownerChannelId` returned by Chzzk's authoritative endpoint.

```ts
// packages/backend/src/services/naverHarvest.ts
const uids = await harvestClipUIDs(streamer.name);             // UIDs from Naver
const newUIDs = uids.filter((u) => !existingIds.has(u));        // not already in DB
const details = await fetchInBatches(                            // concurrency 4 / 150ms gap
  newUIDs, (uid) => getClipFullDetail(uid), 4, 150);             // be polite to Chzzk

for (let i = 0; i < newUIDs.length; i++) {
  const detail = details[i];
  if (!detail) { result.skippedUnreachable++; continue; }

  // Authoritative filter: drop clips that don't belong to this streamer.
  // Search results are fuzzy; the channel-id check makes them safe.
  if (detail.ownerChannelId && detail.ownerChannelId !== streamer.channelId) {
    result.skippedWrongOwner++;
    continue;
  }

  // Category + keyword pre-classifies clips; the admin ratifies later.
  const isSongCandidate =
    detail.clipCategory === "music" &&
    keywordList.some((kw) => detail.clipTitle.toLowerCase().includes(kw));

  await db.insert(clips).values({ /* ... */ status: isSongCandidate ? "song_candidate" : "pending" });
}
```

Batching with a 150 ms gap and a concurrency of 4 is partly good manners and partly a guardrail — it keeps the harvest off the radar of Chzzk's public API.

## Security: two gates in front, plus a boot that fails on weak secrets

Admin routes sit behind a **Cloudflare Access (zero-trust)** gate, so requests that don't pass the IdP check never reach the app at all. Inside, the **JWT admin token** gates them once more. The outer layer verifies *identity*; the inner layer verifies *authorization*.

On top of that, weak secrets are caught before they can leak into production. An earlier version had things like `process.env.JWT_SECRET || "dev-secret-change-in-production"`. If `.env` were missing, anyone reading the source could forge an admin token with the known fallback. The fix: a helper that **throws at import time** so the pod CrashLoops — silent degradation becomes an incident.

```ts
// packages/backend/src/lib/env.ts (essence)
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

// At module load — invalid config → CrashLoop instead of silent insecurity.
const JWT_SECRET = requireEnv("JWT_SECRET", 32);
```

The scariest production state is "running quietly with a weak secret." Not running at all is safer.

## Observability: a metrics design that respects cardinality

I expose an HTTP duration histogram via `prom-client`. With labels you can blow up Prometheus storage in a day, so the label set is deliberately small — `method` / `route` / `status_class`. I bucket status codes into classes (`2xx`/`4xx`/`5xx`), cutting per-route series ~5× without losing operational signal. The `route` label is Hono's matched template path (`/api/clips/:id`), never the raw URL, so cardinality scales with the route table — not with traffic.

```ts
// packages/backend/src/lib/metrics.ts
export const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds, partitioned by method/route/status_class.",
  labelNames: ["method", "route", "status_class"],  // status_code (no) → status_class (yes)
  registers: [register],
});

// /metrics 와 /api/health 는 인스트루먼트에서 제외:
// - /metrics measuring itself = self-inflation
// - /api/health hit by k8s probes every couple seconds = pure noise, distorts p95
const SKIP_PATHS = new Set(["/metrics", "/api/health"]);
```

The Helm chart ships a `ServiceMonitor` so Prometheus Operator picks up new pods on its own, and the Grafana dashboard (7 panels: request rate, p50/p95/p99 latency, status-code breakdown, error rate, top routes, heap/RSS, event-loop lag) loads automatically via a ConfigMap sidecar.

### Don't let metrics go silent

Operating this bit me once: CI's `helm upgrade` was pruning the `ServiceMonitor` on every deploy, so metrics quietly stopped flowing. The dashboard still rendered — just with no data, which is the most dangerous observability state there is. The fix pins `monitoring.enabled=true` in CI, with a post-mortem written up under `docs/ops-issues/`.

### Alerts: watch even for "the target disappearing"

Endpoint availability is watched with **blackbox-exporter probes + PrometheusRule**, and anything over threshold fires **AlertManager → Discord**.

- `EndpointDown` — `probe_success == 0`
- `EndpointSlow` — `probe_duration_seconds > 3`
- `CertExpiringSoon` / `CertExpired` — TLS cert nearing/past expiry
- `ChzzkSongsTargetMissing` — `absent(up{namespace="chzzk-songs"})`. This fires on **the absence of metrics itself**. The incident above taught me that "no signal" is more dangerous than "bad signal."

```yaml
# ops/monitoring/alerts.yaml (essence)
- alert: ChzzkSongsTargetMissing
  # absent() returns 1 when zero series match → fires when the target is gone
  expr: absent(up{namespace="chzzk-songs"})
  for: 10m
  labels: { severity: critical }
```

## Analytics: cookie-less Cloudflare Web Analytics

Visitor stats come from the **Cloudflare Web Analytics beacon** — no npm dependency, just one beacon line in `index.html`. It's **cookie-less**, so it measures site traffic rather than tracking individual users, which keeps it consent-banner-free. Because the beacon POSTs to an external domain, the backend CSP (`script-src` / `connect-src`) allow-lists exactly the Cloudflare domains and nothing else.

```html
<!-- packages/frontend/index.html -->
<script defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "..."}'></script>
```

```ts
// packages/backend/src/app.ts — CSP allow-list (essence)
scriptSrc:  ["'self'", "https://static.cloudflareinsights.com"],
connectSrc: ["'self'", "https://cloudflareinsights.com"],
```

## Frontend: IndexedDB bookmarks with cross-tab sync

Bookmarks are user-local data; there's no reason to send them to a server. `localStorage` would do, but to keep the door open for richer metadata later (notes, custom labels), I went with **IndexedDB** from day one. Open the site in two tabs — toggling a bookmark in one updates the other instantly, via a tiny pattern that piggy-backs on the `storage` event.

```ts
// packages/frontend/src/lib/bookmarks.ts (essence)
const BOOKMARK_CHANGE = "chzzk-bookmark-change";

function poke() {
  // Same tab: a CustomEvent.
  window.dispatchEvent(new CustomEvent(BOOKMARK_CHANGE));
  // Other tabs: bump a localStorage key so a storage event fires.
  try { localStorage.setItem("chzzk_bookmark_tick", String(Date.now())); } catch {}
}

export function onBookmarksChanged(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(BOOKMARK_CHANGE, handler);
  window.addEventListener("storage", handler);           // ← cross-tab sync
  return () => {
    window.removeEventListener(BOOKMARK_CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}
```

## Deployment: GitHub Actions → private registry → k3s

A push to `main` triggers GitHub Actions to:

1. Build the multi-stage Docker image (frontend static assets baked into the backend dist).
2. Push to the private container registry behind Tailscale (`registry.mangru.dev`).
3. `helm upgrade --install` against the k3s cluster.

Merge equals deploy — no operator step in the middle.

## Decisions worth calling out

- **SQLite + WAL, not Postgres.** Single-node ops, read-heavy access pattern. I didn't want to run a separate database just to feel grown-up.
- **External APIs degrade gracefully.** Missing Spotify / YouTube / Naver keys disable the matching helpers; the Chzzk core keeps working.
- **Metrics from day one — and watch for their absence too.** Dashboard + ServiceMonitor shipped with the first backend metrics; after a real incident where metrics silently stopped, I added an `absent()`-based target-missing alert and pinned the CI setting. Latency questions are unanswerable if you wait to instrument; "since when has it been blind?" is unanswerable if you never watch for silence.

## Try it

The **Live** button goes straight to the running site, and **GitHub** has the full source, the Helm chart, and the GitHub Actions workflow.
