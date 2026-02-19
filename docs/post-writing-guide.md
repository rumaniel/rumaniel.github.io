# 포스트 작성 가이드

모든 블로그 포스트는 `_posts/` 디렉터리에 저장됩니다.

## 파일명 규칙

```
YYYY-MM-DD-post-slug.md
```

예시:
```
2026-02-16-github-pages-modernization.md
2026-01-01-new-year-resolution.md
```

---

## Frontmatter 템플릿

모든 포스트는 파일 최상단에 YAML Frontmatter를 포함해야 합니다.

```yaml
---
layout: post
title: "포스트 제목 (큰따옴표 권장)"
description: "간단한 설명 (SEO에 노출됨, 120-160자 권장)"
date: 2026-02-16 14:30:00 +0900
categories: [unity]
tags: [태그1, 태그2, 태그3]
author: rumaniel
---
```

### Frontmatter 필드 설명

| 필드 | 필수 | 설명 |
|------|------|------|
| layout | ✓ | 거의 항상 `post` |
| title | ✓ | 포스트 제목 |
| description | ✗ | OG/Meta description (150자 이내) |
| date | ✓ | 발행 일시 (ISO 8601 형식: YYYY-MM-DD HH:MM:SS +09:00) |
| categories | ✓ | 카테고리 (배열, 단일 major category 1개 권장) |
| tags | ✗ | 태그 (배열) |
| author | ✗ | 저자 (기본값: 설정 파일의 github_username) |

### 권장 카테고리

기존 포스트를 참고하여 선택:
- `unity` - Unity 게임 엔진
- `c#` - C# 언어/개발
- `retrospect` - 회고/일상
- `math` - 수학/이론

카테고리는 navigation/archives 정합성을 위해 **1개만 사용**하고,
세부 주제는 `tags`로 분리합니다.

---

## 콘텐츠 작성 규칙

### 마크다운 문법

```markdown
# 대제목 (H1, 포스트 제목용 - Frontmatter로 처리)
## 소제목 (H2)
### 더 작은 제목 (H3)

**굵게** 또는 __굵게__
*기울임* 또는 _기울임_
~~취소선~~

인라인 `코드`

코드 블록:
\```language
// 코드
\```

- 리스트 항목
  - 중첩 항목
- 항목 2

1. 번호 있는 리스트
2. 항목 2

> 인용문
> 여러 줄 가능

[링크 텍스트](https://example.com)
![이미지 alt](assets/image.jpg)

| 헤더 1 | 헤더 2 |
|--------|--------|
| 셀 1   | 셀 2   |
```

### 이미지 관리

이미지는 `assets/` 디렉터리 하위에 포스트별 폴더에 저장:
```
assets/
  post-slug/
    image1.jpg
    image2.png
```

마크다운에서 참조:
```markdown
![설명]({{ site.baseurl }}/assets/post-slug/image1.jpg)
```

또는 상대 경로:
```markdown
![설명](/assets/post-slug/image1.jpg)
```

### SEO 팁

- **제목**: 모든 단어 대문자 피하고, 54자 이하 권장
- **설명**: 120-160자, 주요 키워드 포함
- **주제**: 한 포스트 = 한 주제 집중
- **내부 링크**: 관련 포스트 2-3개 연결
- **구조화**: H2, H3로 명확한 계층 구조 유지

---

## 포스트 상태 관리

### 초안 (Draft)

완성되지 않은 포스트는 `_drafts/` 디렉터리에 저장:
```
_drafts/
  2026-02-16-wip-future-post.md
```

로컬 빌드에는 포함되지 않으므로:
```bash
# 초안 포함 빌드
bundle exec jekyll build --drafts

# 초안 포함 실시간 서버
bundle exec jekyll serve --drafts
```

### 예약 발행 (Scheduling)

Jekyll은 `date` 필드를 기준으로 미래 날짜 포스트를 제외합니다.
예약 발행이 필요하면 수동으로:
1. 포스트를 `_drafts/`에 보관
2. 발행 전날 `_posts/`로 이동 후 푸시

---

## 로컬 테스트

포스트를 작성한 후 로컬에서 미리보기:

```bash
# 번들 설치 (1회만)
bundle install

# 로컬 서버 시작 (초안 포함)
bundle exec jekyll serve --drafts

# 브라우저에서 확인
# http://localhost:4000
```

---

## 게시 전 체크리스트

- [ ] Frontmatter 모든 필드 확인 (layout, title, date, categories)
- [ ] 제목 및 description 길이 확인 (54자, 160자 이내)
- [ ] 마크다운 문법 오류 없음 (`code`, **bold**, [링크])
- [ ] 이미지 모두 업로드 (경로 확인)
- [ ] 내부 링크 3개 이상 연결 (관련 포스트)
- [ ] 로컬 빌드 확인: `bundle exec jekyll build`
- [ ] `/archives/` 페이지에서 포스트 조회 가능 확인
- [ ] 모바일 화면에서 렌더링 확인 (Chrome DevTools)

---

## 예제

### 최소 포스트

```yaml
---
layout: post
title: "블로그 현대화 완료"
date: 2026-02-16 10:00:00 +0900
categories: [retrospect]
---

# 본문

이것은 예제 포스트입니다.
```

### 완성된 포스트

```yaml
---
layout: post
title: "GitHub Pages 배포 자동화로 Jekyll 블로그 현대화하기"
description: "Jekyll 3.9 → 4.4 마이그레이션, GitHub Actions 워크플로우 추가, monochrome 디자인으로 개선"
date: 2026-02-16 14:30:00 +0900
categories: [web, retrospect]
tags: [jekyll, github-pages, github-actions, devops]
---

# 현대화 완료

오랫동안 방치했던 블로그를...

## 개선 사항

1. GitHub Actions로 배포 자동화
2. Jekyll 4.4로 업그레이드
3. Monochrome 디자인 적용

관련 글: [로컬 개발 환경 설정]({{ site.baseurl }}/docs/local-development.md)
```

---

## 문제 해결

**Q: "포스트가 빌드된 후 보이지 않아요"**

A: 
- `date`가 미래인지 확인 (`_posts/`는 publish 날짜 기준 필터링)
- `layout: post` 확인
- `categories`가 비어있지 않은지 확인
- `bundle exec jekyll build --verbose`로 상세 로그 확인

**Q: "이미지가 깨져 보여요"**

A:
- 이미지 경로가 `assets/` 기준 절대 경로인지 확인
- 파일명이 정확한지 확인 (대소문자 구분)
- 로컬에서 이미지 파일이 존재하는지 확인

**Q: "Frontmatter YAML 에러"**

A:
- 따옴표 사용 규칙 확인 (문자열은 "..." 또는 '...')
- 배열 형식 확인: `categories: [cat1, cat2]` 또는 다중행
- YAML 유효성 검사 도구 사용 ([yamllint.com](https://www.yamllint.com/))

