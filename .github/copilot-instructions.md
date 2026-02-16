# Copilot Instructions for `rumaniel.github.io`

## Mission

이 저장소를 **GitHub Pages 최신 권장 방식(2026 기준)**으로 현대화한다.
핵심 목표:

1. 배포 자동화 단순화 (`GitHub Actions` 기반)
2. 구식 템플릿/스타일 개선
3. 플러그인/기능 확장성 확보
4. 운영 피로도(배포/리소스 정리) 감소

---

## Current Baseline (Do not assume otherwise)

- Static site generator: Jekyll
- Current config: `_config.yml` with `theme: minima`
- Current dependencies: old Jekyll/Gemfile stack (3.x 기반)
- Pages workflow: 없음 (`.github/workflows` 미구성)
- Branch: `master` (default)
- Generated output `_site`는 커밋하지 않음 (`.gitignore` 포함)

---

## Source of Truth Files

항상 작업 시작 시 아래 문서를 우선 확인:

1. `docs/github-pages-modernization-plan.md`
2. `docs/migration-backlog.md`
3. 이 파일 `.github/copilot-instructions.md`

문서 간 충돌 시 우선순위는 위 순서.

---

## Execution Rules

- 작은 단위로 변경하고, 각 변경 후 검증한다.
- 리팩토링은 **URL/permalink 보존**을 기본 원칙으로 한다.
- 디자인 개선은 하되, 콘텐츠(포스트 원문/Frontmatter)는 불필요하게 바꾸지 않는다.
- `_site`, 캐시, 빌드 산출물은 절대 커밋하지 않는다.
- 도구 체인 추가 시(예: Node 기반 빌드 보조) 이유와 롤백 방법을 문서화한다.

---

## Preferred Deployment Architecture

기본 방향은 다음을 따른다:

- GitHub Pages Source: `GitHub Actions`
- Workflow: build + deploy jobs
  - `actions/checkout`
  - `actions/configure-pages`
  - `actions/jekyll-build-pages` (or equivalent build)
  - `actions/upload-pages-artifact`
  - `actions/deploy-pages`

---

## Session Start Checklist (for future Copilot sessions)

세션 시작 시 반드시 수행:

1. 백로그에서 `TODO` 중 최우선 1~3개를 `DOING`으로 전환
2. 이번 세션의 완료 기준(acceptance criteria) 명시
3. 변경 파일 최소화 원칙 적용
4. 작업 종료 시 백로그 상태 업데이트 (`DONE/BLOCKED`)

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

## Suggested Next Milestone

다음 실작업 우선순위:

1. `.github/workflows/pages.yml` 추가
2. Pages 설정을 Actions 기반으로 전환
3. 첫 자동 배포 성공 확인
4. 이후 테마/스타일 개선 착수

---

## Notes for Copilot Behavior

- 사용자가 "조사", "코스팅", "계획"을 요청하면 문서(`docs/*`)를 먼저 업데이트한다.
- 사용자가 "바로 진행"을 요청하면 백로그 상단 TODO부터 순차 구현한다.
- 매 세션 종료 전 반드시 다음 액션 1~2개를 제안한다.
