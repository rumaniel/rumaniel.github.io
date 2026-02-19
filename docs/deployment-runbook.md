# GitHub Pages 배포 런북

## 목적

- GitHub Actions 기반 배포의 운영 피로도를 줄이고, 실패 시 빠르게 원인 파악/복구하기 위한 기준 문서

## 정상 배포 경로

1. `master` 브랜치에 변경 merge
2. `Deploy Jekyll site to Pages` 워크플로우 실행
3. `build` 성공 후 `deploy` 성공
4. `github-pages` 환경 URL 반영 확인

## 실패 체크포인트 (우선순위 순)

### 1) 권한/설정

- 저장소 Settings > Pages > Source가 `GitHub Actions` 인지 확인
- 워크플로우 permissions에 아래 3개 포함 여부 확인
  - `contents: read`
  - `pages: write`
  - `id-token: write`

### 2) 워크플로우 액션 버전

- `.github/workflows/pages.yml`의 액션 버전 점검
  - `actions/checkout@v5`
  - `actions/configure-pages@v5`
  - `ruby/setup-ruby@v1`
  - `bundle exec jekyll build` 실행 단계 존재
  - `actions/upload-pages-artifact@v4`
  - `actions/deploy-pages@v4`

### 3) 빌드 단계 실패

- `Build with Jekyll` 로그에서 gem 충돌/문법 오류 확인
- `_config.yml` 오탈자, 플러그인 설정, front matter 파싱 오류 우선 점검

### 4) 아티팩트 업로드/배포 실패

- `Upload artifact` 단계에서 `_site` 생성 여부 확인
- `deploy` job이 `needs: build` 로 연결되어 있는지 확인
- `environment: github-pages` 설정과 URL 출력 확인

### 5) 배포 후 렌더/SEO 회귀

- 주요 경로 확인: `/`, `/about/`, 샘플 포스트, `/404.html`
- 기본 SEO 확인: title, description, canonical, feed

## 자주 발생하는 이슈

### Q1. 워크플로우 파일 푸시가 거절됨

- 증상: `refusing to allow an OAuth App to create or update workflow ... without workflow scope`
- 조치: 인증 토큰에 `workflow` 스코프 포함 후 재푸시

### Q2. 로컬과 GitHub 배포 결과가 다름

- 조치:
  - `bundle install` 재실행
  - 로컬 Ruby/Bundler 버전 확인
  - Actions 로그의 gem 버전 차이 확인

## 롤백 기준

- 배포 실패가 2회 이상 반복되거나 주요 페이지 렌더 손상이 확인되면
  - 마지막 정상 커밋으로 롤백 PR 생성
  - 원인 해결 후 재배포

## 다음 개선 항목

- 배포 상태 배지 추가
- 실패 시 Slack/메일 알림 연동
- `docs/` 공개 범위 제어 정책 적용
