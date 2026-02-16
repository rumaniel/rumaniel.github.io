# GitHub Pages 최신화 리팩토링 조사/코스팅 (2026-02)

## 1) 현재 상태 진단

이 레포는 전형적인 구버전 Jekyll 블로그 구조이며, 아래 특성이 확인됨.

- Jekyll: `3.9.x` 계열 (`Gemfile`)
- Theme: `minima 2.x`
- 배포 자동화: 없음 (`.github/workflows/*` 부재)
- 빌드 산출물: `_site` 디렉터리는 존재하지만 `.gitignore` 에서 제외 중
- 플러그인: `_config.yml`에 `jekyll-feed`, `jekyll-seo-tag`, `jekyll-gist`

현재 불편사항(요청 내용과 일치):
- 템플릿/스타일 노후화
- 배포 프로세스 수작업 부담
- 플러그인 확장성 낮음
- 리소스 관리(자산/정적 파일) 부담

---

## 2) 2026 기준 GitHub Pages 권장 방식 (요약)

공식 문서 기준 핵심:

- **GitHub Actions 기반 custom workflow 배포가 권장**
- `github-pages` gem 방식은 여전히 지원되나, 배포/자동화 관점에서는 Actions 중심 권장
- 표준 액션 조합:
  - `actions/configure-pages`
  - `actions/upload-pages-artifact`
  - `actions/deploy-pages`
- Jekyll 빌드 시 `actions/jekyll-build-pages` 템플릿 사용 가능

즉, "브랜치에 `_site`를 커밋해서 배포"나 "서버 기본 빌드에 의존"보다,
**레포 내 워크플로우로 빌드/배포를 명시적으로 관리**하는 방식이 최신 권장 흐름임.

---

## 3) 목표 아키텍처 (권장)

### 권장안 A (리스크/비용 최적)

**Jekyll 유지 + GitHub Actions 배포 + 테마/구조 현대화**

- 콘텐츠 구조(`_posts`) 유지 → 마이그레이션 리스크 최소
- 배포는 Actions로 완전 자동화
- 테마는 다음 중 택1:
  - `minima` 최신 계열 커스터마이징
  - `remote_theme` 기반 현대 테마 채택
  - 커스텀 레이아웃 점진 전환

### 대안 B (디자인 자유도 높음)

**Astro/Eleventy 등으로 SSG 교체 + Pages Actions 배포**

- 장점: 최신 DX, 성능/컴포넌트 생태계 강점
- 단점: 초기 이관 비용 큼(Frontmatter/템플릿/링크/자산 재정비 필요)

요청상 "레포 자체 리팩토링"과 "운영 피로도 감소" 관점에서는
**권장안 A부터 시작 후 필요 시 B로 확장**이 가장 현실적.

---

## 4) 코스팅 (예상)

가정:
- 1인 작업
- 기존 포스트 콘텐츠는 최대한 유지
- 도메인/외부 SaaS 신규 도입 최소

### 비용(금액)

- GitHub Pages(공개 레포): 일반적으로 무료 범위
- GitHub Actions: 공개 레포는 일반적으로 무료 범위에서 충분
- 선택 비용:
  - 커스텀 도메인: 연간 약 1~3만 원대 (도메인별 상이)
  - 유료 댓글/검색 SaaS 도입 시 별도

### 비용(노력/일정)

#### 옵션 A: Jekyll 유지 + Actions + 현대화
- 최소 MVP: **2~4일**
  - 배포 자동화, 기본 테마 정리, 리소스 규칙 정립
- 안정화 포함: **1~2주**
  - 디자인 개선, 플러그인 검증, SEO/성능/회귀 점검

#### 옵션 B: SSG 교체(Astro/Eleventy)
- MVP 이관: **1~2주**
- 안정화 포함: **2~4주**
  - 템플릿 재작성, 콘텐츠 렌더링 검증, URL/SEO 보존 작업

---

## 5) 작업 분해 (WBS)

### Phase 0. 기준선 고정 (0.5일)
- 현재 사이트 스냅샷(홈/포스트/about/404) 캡처
- 필수 URL 목록화(기존 permalink 보존 기준)
- 현재 플러그인/레이아웃 의존성 체크리스트 작성

### Phase 1. 배포 현대화 (0.5~1일)
- GitHub Pages Source를 "GitHub Actions"로 전환
- `.github/workflows/pages.yml` 작성
- 브랜치 전략 정의(`master` push 시 자동 배포)
- 배포 실패 시 로그 확인/재시도 가이드 문서화

### Phase 2. 런타임/의존성 정리 (0.5~1일)
- Gemfile 현대화 (Jekyll 4 계열 또는 github-pages 전략 명확화)
- 로컬 실행 표준 명령 통일 (`bundle exec jekyll serve`)
- 불필요/충돌 gem 정리

### Phase 3. 디자인/정보구조 리팩토링 (1~3일)
- 헤더/푸터/타이포/간격 시스템 정비
- 메인/포스트/카테고리 템플릿 개선
- 자산 경로/네이밍 정책 통일

### Phase 4. 플러그인/기능 확장성 확보 (0.5~2일)
- 필요한 플러그인 후보 선정(TOC, sitemap, archives 등)
- Pages 제약 고려:
  - Actions에서 빌드하므로 기본 제약 완화 가능
  - 다만 보안/유지보수성 기준으로 최소 도입
- 기능별 도입/롤백 기준 정의

### Phase 5. 검증/런북 (0.5~1일)
- 로컬 빌드/Actions 빌드/실제 배포 URL 검증
- 404, RSS, SEO 메타, canonical, robots, sitemap 확인
- 운영 런북(배포/장애대응/콘텐츠 작성 규칙) 작성

---

## 6) 리스크와 대응

- URL 변경으로 인한 SEO 손실
  - 대응: permalink 유지, 필요 시 redirect 매핑
- 테마 교체 시 레이아웃 회귀
  - 대응: 핵심 페이지 스냅샷 비교
- gem 충돌/윈도우 로컬 환경 이슈
  - 대응: Ruby/Bundler 버전 고정, `webrick`/`tzinfo-data` 점검

---

## 7) 권장 실행안 (바로 시작)

1. **옵션 A로 착수** (Jekyll 유지)
2. 먼저 배포 자동화(Phase 1) 완료
3. 그 다음 디자인/확장성(Phase 3~4)을 작은 PR 단위로 진행
4. 마지막에 런북과 Copilot 지침 업데이트

---

## 8) 완료 기준 (Definition of Done)

- `master` push → GitHub Pages 자동 배포 성공
- 로컬/원격 렌더 결과 주요 페이지 일치
- `_site` 미커밋 정책 유지
- 신규 플러그인 1개 이상 안전 도입 가능 상태
- 운영 문서(배포/작성/장애대응) 최신화 완료

---

## 9) 브랜치/배포 운영 계획

### 브랜치 전략

- `master`: 배포 기준 브랜치 (Pages Actions가 직접 배포)
- `feat/<epic-or-topic>`: 기능 단위 작업 브랜치
- `fix/<topic>`: 긴급 수정 브랜치
- 병합 방식: PR 기반, 기본은 squash merge

### PR 운영 규칙

- 한 PR은 하나의 의도만 포함
- PR 템플릿에 다음 항목 필수:
  - 변경 요약
  - 영향 범위(레이아웃/SEO/스타일)
  - 검증(로컬 빌드 or Actions 로그)

### 배포 주기

- 기본은 **merge 즉시 배포** (작은 변경 기준)
- 디자인/구조 변경은 주간 배포 윈도우로 묶어 배포
  - 권장: 주 1회 (예: 금요일)
- 긴급 수정은 수시 배포

### 버전/릴리즈 표기

- 큰 변경(Epic 단위)은 Git 태그로 기록
  - 예: `v2026.02-epic3`
- 릴리즈 노트는 PR 본문에 요약 유지
