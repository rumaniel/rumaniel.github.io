# GitHub Pages 현대화 백로그

진행 상태 표기: `TODO` / `DOING` / `DONE` / `BLOCKED`

---

## 📊 완료 현황

**모든 에픽 완료**: ✅ **Feb 16, 2026**

| Epic | 제목 | 상태 | 완료일 |
|------|------|------|--------|
| 1 | 배포 자동화 (GitHub Actions) | ✅ DONE | Feb 14 |
| 2 | 의존성 정리 | ✅ DONE | Feb 15 |
| 3 | 템플릿/디자인 개선 | ✅ DONE | Feb 15 |
| 4 | 확장성(플러그인) | ✅ DONE | Feb 16 |
| 5 | 운영 문서 | ✅ DONE | Feb 16 |
| 6 | 공개 범위/노출 제어 | ✅ DONE | Feb 16 |

**주요 성과**:
- 🚀 GitHub Actions 기반 자동 배포 파이프라인 구축
- 📦 Jekyll 3.9 → 4.4 마이그레이션 (의존성 최신화)
- 🎨 Monochrome 미니멀 디자인 + 반응형 모바일 지원
- 🔌 jekyll-sitemap, jekyll-archives 플러그인 추가 (SEO 최적화)
- 📚 운영/개발 문서 완비 (post-writing-guide, troubleshooting-faq)
- 🔒 내부 문서(`docs/`) 공개 범위 제어

**다음 단계**: 
- feat/pages-actions-setup 브랜치 → PR 리뷰/머지
- 프로덕션 배포 확인
- Issues/토론 기반 지속적 개선

---

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
- [x] (DONE) 코드 블록/인용/표 스타일 개선
- [x] (DONE) 모바일 타이포/간격 튜닝

## Epic 4. 확장성(플러그인)

- [x] (DONE) 플러그인 우선순위 목록 작성
  - see: `docs/plugin-strategy.md`
- [x] (DONE) jekyll-sitemap 도입 (1차 플러그인)
  - gem 추가, _config.yml 반영, 빌드 검증 ✓
- [x] (DONE) jekyll-archives 도입 (2차 플러그인, 아카이브 페이지)
  - gem 추가, _layouts/archive.html 생성, year/month/category archives 생성 ✓
- [x] (DONE) 플러그인 도입 기준(보안/유지보수) 문서화
  - see: `docs/plugin-strategy.md` 도입 기준 섹션

## Epic 5. 운영 문서

- [x] (DONE) 배포 런북 작성
  - see: `docs/deployment-runbook.md` (이전에 생성됨)
- [x] (DONE) 포스트 작성 가이드(Frontmatter 템플릿) 작성
  - see: `docs/post-writing-guide.md` (Frontmatter 템플릿, 이미지 관리, SEO 팁)
- [x] (DONE) 트러블슈팅 FAQ 작성
  - see: `docs/troubleshooting-faq.md` (12개 항목, 빌드/콘텐츠/SEO 문제)

## Epic 6. 공개 범위/노출 제어

- [x] (DONE) `docs/` 디렉터리가 사이트 본문에 노출되지 않도록 정책 확정
  - 선택: `_config.yml` `exclude`에 `docs/` 추가 (보안 및 명확성)
- [x] (DONE) 노출 제어 적용 후 URL 접근 회귀 검증
  - 검증: docs/ 디렉터리가 _site/ 빌드 출력에 포함되지 않음 ✓

