# GitHub Pages 현대화 백로그

진행 상태 표기: `TODO` / `DOING` / `DONE` / `BLOCKED`

## Epic 1. 배포 자동화 (GitHub Actions)

- [x] (DONE) `pages.yml` 워크플로우 추가
  - checkout / configure-pages / jekyll-build-pages / upload-pages-artifact / deploy-pages
- [x] (DONE) 저장소 Pages 설정을 `GitHub Actions`로 전환
- [x] (DONE) `master` push 자동 배포 검증
- [x] (DONE) 실패 로그 체크 포인트 문서화

## Epic 2. 의존성 정리

- [x] (DONE) Gemfile 전략 확정
  - 안1: `jekyll 4` 중심
  - 안2: `github-pages` gem 중심(로컬 호환 우선)
- [x] (DONE) 중복/불필요 gem 제거
- [x] (DONE) 로컬 실행 명령/버전 문서화

## Epic 3. 템플릿/디자인 개선

- [x] (DONE) `_includes/head.html` 메타 구조 정리(SEO/OG)
- [x] (DONE) 홈/포스트 목록 가독성 개선
- [ ] (TODO) 코드 블록/인용/표 스타일 개선
- [ ] (TODO) 모바일 타이포/간격 튜닝

## Epic 4. 확장성(플러그인)

- [ ] (TODO) 플러그인 우선순위 목록 작성
- [ ] (TODO) 1차 플러그인 도입 및 회귀 테스트
- [ ] (TODO) 플러그인 도입 기준(보안/유지보수) 문서화

## Epic 5. 운영 문서

- [ ] (TODO) 배포 런북 작성
- [ ] (TODO) 포스트 작성 가이드(Frontmatter 템플릿) 작성
- [ ] (TODO) 트러블슈팅 FAQ 작성

## Epic 6. 공개 범위/노출 제어

- [ ] (TODO) `docs/` 디렉터리가 사이트 본문에 노출되지 않도록 정책 확정
  - 안1: `_config.yml` `exclude`에 `docs/` 추가
  - 안2: 내부 문서를 `_data` 또는 별도 private 저장소로 분리
- [ ] (TODO) 노출 제어 적용 후 URL 접근 회귀 검증 (`/docs/*` 차단 확인)

