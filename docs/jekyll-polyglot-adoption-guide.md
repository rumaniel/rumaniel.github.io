# Jekyll Polyglot 도입 가이드 (KO/EN)

이 문서는 이 저장소(`rumaniel.github.io`)에 `jekyll-polyglot`을 도입할 때,
아래를 **운영 기준**으로 고정하기 위한 문서입니다.

1. 왜 이 결정을 했는가 (의사결정 근거)
2. 어떤 스택이 필요한가 (필수/권장 환경)
3. 단계별 적용 방법과 주의사항
4. 이후 신규 포스트/페이지 작성 예시

---

## 1) 배경과 의사결정 근거

### 왜 Polyglot인가?

현재 사이트는 다음 특성을 가집니다.

- Jekyll 기반 정적 사이트
- GitHub Actions 기반 빌드/배포
- `jekyll-archives`, `jekyll-seo-tag`, `jekyll-sitemap` 사용
- URL/permalink 보존이 중요한 운영 원칙

다국어 토글을 구현하는 방법은 크게

- 수동 구현(Liquid 조건 분기 + 데이터 파일)
- 플러그인 기반(`jekyll-polyglot`)

으로 나뉘며, 이 저장소에서는 **SEO 및 운영 확장성**을 이유로 Polyglot을 채택합니다.

### 이 결정을 한 이유

1. **SEO 확장성**
   - 다국어 사이트 구조(`/en/...`, 기본언어 루트)를 일관되게 만들기 쉽습니다.
   - `hreflang`/alternate 링크 구성 시 확장성이 좋습니다.

2. **운영 단순화**
   - 페이지/포스트 언어 매핑 규칙을 front matter 중심으로 통일할 수 있습니다.
   - 번역 미완료 콘텐츠 fallback 전략을 운영 정책으로 명시하기 좋습니다.

3. **현재 아키텍처와 합치**
   - 이미 GitHub Actions로 빌드하므로 GitHub Pages 기본 whitelist 제약의 영향이 작습니다.

### URL 정책 결정

- 기본 언어: `ko`
- 추가 언어: `en`
- 일반 페이지(예: about): **동일 슬러그 유지**
  - ko: `/about/`
  - en: `/en/about/`

이 정책은 링크 구조를 단순하게 유지하고, 내부 운영자/검색엔진 양쪽에서 예측 가능성을 높입니다.

---

## 2) 필수 스택 / 선행 조건

## 런타임

- Ruby 3.2+ (권장 3.3+)
- Bundler
- Jekyll 4.4 계열

## Jekyll 플러그인 스택

필수/공존 플러그인:

- `jekyll-polyglot`
- `jekyll-archives`
- `jekyll-seo-tag`
- `jekyll-sitemap`
- `jekyll-feed`
- `jekyll-gist`

## 배포 스택

- GitHub Actions 기반 Pages 배포
- 워크플로우 파일: `.github/workflows/pages.yml`
- 빌드 커맨드: `bundle exec jekyll build`

## OS 주의사항

- Windows 로컬에서는 Polyglot 병렬 빌드 충돌 가능성이 있으므로
  - `parallel_localization: false` 권장

---

## 3) 적용 전 원칙 (반드시 준수)

1. **기존 URL 보존 우선**
   - 기존 한국어 URL은 가능하면 유지합니다.

2. **점진 번역 전략**
   - 기존 한국어 콘텐츠는 유지
   - 영어 콘텐츠는 필요한 포스트/페이지부터 순차 추가

3. **문서와 코드 동기화**
   - 설정 변경 시 `docs/post-writing-guide.md`, `docs/deployment-runbook.md` 반영

4. **빌드 산출물 커밋 금지**
   - `_site/` 커밋 금지 유지

---

## 4) 단계별 적용 가이드 (주의사항 포함)

## Step 0. 베이스라인 캡처

### 할 일

- 주요 URL 동작 캡처
  - `/`
  - `/about/`
  - `/categories/`
  - `/archives/<category>/`
  - 샘플 포스트 1개
  - `/404.html`

### 주의사항

- 이 스냅샷은 회귀(링크 깨짐/메타태그 누락) 판단 기준입니다.

---

## Step 1. Gemfile / _config.yml 설정

### 할 일

1. `Gemfile`에 `jekyll-polyglot` 추가
2. `_config.yml`에 Polyglot 설정 추가

권장 예시:

```yml
plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-gist
  - jekyll-sitemap
  - jekyll-archives
  - jekyll-polyglot

languages: ["ko", "en"]
default_lang: "ko"
parallel_localization: false

exclude_from_localization:
  - assets
  - css
  - js
  - sitemap.xml
  - robots.txt
  - feed.xml
```

### 주의사항

- `exclude`와 `exclude_from_localization`은 목적이 다릅니다.
  - `exclude`: 아예 빌드 대상에서 제외
  - `exclude_from_localization`: 빌드하되 언어별 복제는 하지 않음
- `sitemap.xml`은 루트 단일 파일 유지가 일반적으로 안전합니다.

---

## Step 2. 일반 페이지(about 등) 언어 매핑

### 할 일

- 페이지 번역 쌍을 만들 때 `page_id`로 연결합니다.
- permalink는 동일 슬러그 정책 유지

예시 (ko):

```yml
---
layout: page
title: About
permalink: /about/
lang: ko
page_id: about
---
```

예시 (en):

```yml
---
layout: page
title: About
permalink: /about/
lang: en
page_id: about
---
```

> en은 실제 출력 시 `/en/about/`로 빌드됩니다.

### 주의사항

- `page_id` 누락 시 언어 쌍 인식이 어긋날 수 있습니다.
- 언어별로 permalink를 다르게 가져가려면 의도적으로 설계하고, 문서화 후 적용합니다.

---

## Step 3. 포스트 언어 매핑

### 할 일

- 포스트 front matter에 `lang` 명시
- 언어 쌍 식별을 위해 파일명/slug/permalink 규칙을 일관되게 유지

### 주의사항

- 번역 포스트의 날짜/slug/permalink 규칙이 흔들리면 토글/SEO 링크가 꼬일 수 있습니다.
- 번역이 없는 포스트는 fallback 정책으로 처리하되, 사용자 안내 문구를 고려합니다.

---

## Step 4. Header/토글/내비게이션 연결

### 할 일

- 언어 토글 UI를 header에 배치
- 현재 언어(`site.active_lang`)와 가능한 언어 목록(`site.languages`) 기반 렌더링
- 토글 링크는 현재 페이지의 번역 permalink 정보를 우선 사용

### 주의사항

- Polyglot URL relativization으로 의도치 않게 링크가 변환될 수 있습니다.
- 언어 토글 같은 고정 링크는 필요 시 `static_href` 패턴을 사용해 보호합니다.

---

## Step 5. Archive / Categories 동작 확인

### 할 일

- `categories.md`의 `/archives/<slug>/` 링크가 언어 사이트에서도 정상 동작하는지 확인
- `archive` 레이아웃에서 포스트 링크가 현재 언어 사이트로 유지되는지 확인

### 주의사항

- `jekyll-archives` + Polyglot 조합에서 카테고리 목록/개수 중복 여부를 반드시 확인합니다.
- 번역 미완료 fallback 페이지가 archive 집계에 포함되는지 정책적으로 검토합니다.

---

## Step 6. SEO 태그 점검 (head)

### 할 일

- `canonical`이 언어별 실제 URL을 가리키는지 확인
- `hreflang` alternate 링크가 KO/EN 쌍으로 생성되는지 확인

### 주의사항

- canonical/hreflang 충돌은 다국어 SEO에서 가장 치명적인 회귀입니다.
- 한 페이지에서 canonical이 타 언어를 가리키지 않도록 주의합니다.

---

## Step 7. 로컬/CI 검증

### 로컬 검증

```bash
bundle install
bundle exec jekyll build
bundle exec jekyll serve
```

확인 항목:

- `/`, `/about/`, `/categories/`, `/archives/<slug>/`
- `/en/`, `/en/about/`, `/en/categories/`, `/en/archives/<slug>/`
- 포스트 상세에서 언어 전환 링크
- fallback 동작(번역 없는 페이지)

### CI 검증

- GitHub Actions에서 `Build with Jekyll` 성공
- 배포 후 실제 URL 접근 확인

---

## 5) 회귀/장애 체크리스트

배포 전:

- [ ] 기본 언어 URL 기존 경로 유지
- [ ] `/en/...` 경로 정상 생성
- [ ] categories 카드 링크 정상
- [ ] archive 목록 링크 정상
- [ ] canonical/hreflang 검증
- [ ] sitemap 루트 단일 파일 유지
- [ ] 404 페이지 언어별 접근 확인

배포 후:

- [ ] 홈/포스트/about/en-about 렌더 확인
- [ ] 모바일 메뉴 + 언어 토글 동작
- [ ] 검색엔진 인덱싱 에러(추후 Search Console) 모니터링

---

## 6) 신규 포스트 작성 규칙 + 예제

## 규칙

1. 모든 새 포스트는 `lang` 명시
2. 번역 쌍은 permalink/slug 규칙 통일
3. 번역이 없는 경우에도 기본언어 문서는 완전한 메타정보 유지

## 예제 A: 한국어 포스트 (원문)

파일: `_posts/2026-03-01-jekyll-polyglot-setup.ko.md`

```yml
---
layout: post
title: "Jekyll Polyglot 도입기"
description: "Jekyll 블로그에 KO/EN 다국어를 도입한 설정과 검증 포인트"
date: 2026-03-01 09:00:00 +0900
categories: [web]
tags: [jekyll, polyglot, i18n, seo]
lang: ko
permalink: /jekyll-polyglot-setup/
---
```

본문 예시:

```md
# 배경

이번 글에서는 기존 Jekyll 블로그에 Polyglot을 도입한 과정을 정리합니다.
```

## 예제 B: 영어 번역 포스트

파일: `_posts/2026-03-01-jekyll-polyglot-setup.en.md`

```yml
---
layout: post
title: "Adopting Jekyll Polyglot"
description: "How I introduced KO/EN multilingual support with SEO-safe routing"
date: 2026-03-01 09:00:00 +0900
categories: [web]
tags: [jekyll, polyglot, i18n, seo]
lang: en
permalink: /jekyll-polyglot-setup/
---
```

본문 예시:

```md
# Background

In this post, I share how I added Polyglot to an existing Jekyll blog.
```

## 작성 시 주의사항

- ko/en 모두 `permalink`를 동일하게 맞춰야 언어 전환이 예측 가능합니다.
- 카테고리 명은 운영 정책(정규화 문서)에 맞게 유지합니다.
- `description`은 언어별로 직접 작성합니다(기계번역 붙여넣기 금지 권장).

---

## 7) 신규 페이지 작성 규칙 + 예제

## 규칙

1. 페이지는 언어별 파일을 분리
2. 같은 페이지군은 동일 `page_id` 사용
3. permalink는 동일 슬러그 유지 정책 우선

## 예제 A: Contact 페이지 (KO)

파일: `contact.ko.md`

```yml
---
layout: page
title: Contact
permalink: /contact/
lang: ko
page_id: contact
---

문의는 이메일로 부탁드립니다.
```

## 예제 B: Contact 페이지 (EN)

파일: `contact.en.md`

```yml
---
layout: page
title: Contact
permalink: /contact/
lang: en
page_id: contact
---

Please contact me via email.
```

## 작성 시 주의사항

- `page_id`가 다르면 같은 페이지로 연결되지 않습니다.
- 번역 페이지를 늦게 추가하는 경우 fallback 노출 여부를 확인합니다.
- 내비게이션에 신규 페이지를 추가하면 언어별 라벨 정책도 함께 반영합니다.

---

## 8) fallback 정책

번역이 아직 없는 경우, 기본언어 콘텐츠를 fallback으로 노출할 수 있습니다.

운영 정책 권장:

1. fallback 페이지에는 "해당 언어 번역 준비 중" 안내 문구 표시
2. 주요 랜딩/소개 페이지(`about`, `contact`)는 fallback 없이 우선 번역
3. 포스트는 fallback 허용, 상단 공지로 UX 보완

---

## 9) 자주 발생하는 문제와 조치

### 문제 1. `/en/categories/`는 열리는데 카드 링크가 404

- 원인: archive 경로 상대화/slug 불일치
- 조치:
  1. categories 링크 생성 로직 점검
  2. archive permalink 설정 점검
  3. 로컬 빌드 산출물에서 실제 경로 확인

### 문제 2. canonical이 `/about/`만 가리키고 `/en/about/`를 무시

- 원인: head 템플릿에서 언어 컨텍스트 미반영
- 조치:
  1. SEO 태그 출력 위치/순서 점검
  2. 페이지별 실제 canonical 출력값 확인

### 문제 3. 로컬(Windows)에서 빌드가 불안정

- 원인: 병렬 로컬라이제이션 충돌
- 조치: `_config.yml`에서 `parallel_localization: false`

---

## 10) 실행 명령 모음

```bash
# 의존성 설치
bundle install

# 빌드
bundle exec jekyll build

# 로컬 서버
bundle exec jekyll serve

# Draft 포함 확인
bundle exec jekyll serve --drafts
```

---

## 11) 다음 액션 (권장)

1. Polyglot 설정 반영 PR 생성
2. `about` 영어 페이지 추가 + 언어 토글 UI 최소 구현
3. 샘플 포스트(1개) KO/EN 쌍으로 검증
4. archive/categories 회귀 테스트 후 배포

---

## 부록) 최소 점검표 (복사용)

```md
- [ ] Gemfile / _config.yml polyglot 설정 반영
- [ ] ko/en 언어 설정 + default_lang 확인
- [ ] about 페이지 ko/en 페어(page_id) 확인
- [ ] categories → archives 링크 확인
- [ ] hreflang/canonical 확인
- [ ] sitemap 단일성 확인
- [ ] 로컬/CI 빌드 성공
- [ ] 주요 URL 수동 점검 완료
```
