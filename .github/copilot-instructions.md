# Copilot Instructions for `rumaniel.github.io`

## Mission

Jekyll 기반 한/영 개인 블로그 + 포트폴리오(`_posts`, `_projects`, `_case_studies`)를 GitHub Actions로 GitHub Pages에 배포한다.
유지 목표: 배포 자동화 단순성, 플러그인/기능 확장성, 낮은 운영 피로도.

---

## Current Baseline

- Static site generator: Jekyll
- Current config: `_config.yml` with `theme: minima`
- Current dependencies: Jekyll 4 + 플러그인 (`Gemfile`, `_config.yml`의 `plugins:`)
- i18n: `jekyll-polyglot` — `ko`(기본) / `en`. 작성 규칙은 `docs/jekyll-polyglot-adoption-guide.md`
- Pages workflow: `.github/workflows/pages.yml` — `master` push 시 빌드·배포
- Branch: `master` (default)
- Generated output `_site`는 커밋하지 않음 (`.gitignore` 포함)

---

## Planning Docs

작업 계획 시 참고:

1. `docs/migration-backlog.md` — 남은 작업 목록
2. `docs/github-pages-modernization-plan.md` — 현대화 착수 당시 계획 (기록용)

문서와 저장소가 다르면 저장소 파일(`Gemfile`, `_config.yml`, `.github/workflows/`)이 기준이다.

---

## Execution Rules

- 작은 단위로 변경하고, 각 변경 후 검증한다.
- 리팩토링은 **URL/permalink 보존**을 기본 원칙으로 한다.
- 디자인 개선은 하되, 콘텐츠(포스트 원문/Frontmatter)는 불필요하게 바꾸지 않는다.
- `_site`, 캐시, 빌드 산출물은 절대 커밋하지 않는다.
- 도구 체인 추가 시(예: Node 기반 빌드 보조) 이유와 롤백 방법을 문서화한다.

---

## Deployment Architecture

- GitHub Pages Source: `GitHub Actions`
- Workflow: `.github/workflows/pages.yml` — build + deploy jobs
  - `actions/checkout`
  - `actions/configure-pages`
  - `ruby/setup-ruby` + `bundle exec jekyll build` — `jekyll-polyglot`, `jekyll-archives`는 GitHub Pages 허용 목록 밖이라 `actions/jekyll-build-pages`에선 무시된다
  - `actions/upload-pages-artifact`
  - `actions/deploy-pages`

---

## Backlog Upkeep

백로그 항목을 끝내거나 막히면 같은 변경에서 상태를 `DONE`/`BLOCKED`로 갱신한다. 백로그가 실제 남은 작업과 맞아야 다음 세션이 끝난 일을 반복하지 않는다.

---

## Validation Checklist

변경 후 가능한 범위에서 확인:

- 로컬 빌드 성공 (`bundle exec jekyll serve` 또는 `bundle exec jekyll build`)
- GitHub Actions workflow 문법/권한/artifact 흐름 정상
- 주요 페이지 렌더 확인: `/`, `/about/`, 샘플 포스트 1개, `/404.html`
- SEO 기본값 확인: title, description, canonical, feed

---

## Coding Style & Scope

- 기존 구조를 존중하고, 불필요한 대규모 재배치를 피한다.
- 한 번에 하나의 의도를 가진 변경 세트를 만든다.
- 새로운 의존성 추가 시 `왜 필요한지`를 문서에 한 줄로 남긴다.
- 문제가 생기면 임시 우회보다 원인 해결을 우선한다.

---

## Notes for Copilot Behavior

- 사용자가 "조사", "코스팅", "계획"을 요청하면 문서(`docs/*`)를 먼저 업데이트한다.
- 사용자가 "바로 진행"을 요청하면 백로그 상단 TODO부터 순차 구현한다.
- 매 세션 종료 전 반드시 다음 액션 1~2개를 제안한다.
