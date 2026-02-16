# 트러블슈팅 FAQ

블로그 운영 중 자주 마주치는 문제들과 해결 방법을 정리합니다.

## 빌드 및 배포 문제

### 1. GitHub Actions 워크플로우 실패

**증상**: `Deploy Jekyll site to Pages` 워크플로우가 빨간 ✗ 표시

**해결 순서**:

1. **워크플로우 로그 확인**
   - Repository > Actions > 최근 실행 클릭
   - `Build with Jekyll` 또는 `Deploy Pages` 단계에서 오류 메시지 확인

2. **빌드 단계 실패 (`Build with Jekyll`)**
   - 원인: `_config.yml` 문법 오류, 플러그인 충돌, Frontmatter 파싱 오류
   - 해결:
     ```bash
     # 로컬에서 먼저 빌드 시도
     bundle exec jekyll build
     ```
   - 로컬에서 오류 메시지 확인 후 수정

3. **배포 단계 실패 (`Deploy Pages`)**
   - 원인: 권한 부족, artifact 손상
   - 확인 사항:
     - Settings > Pages > Source가 `GitHub Actions` 인지 확인
     - Workflow permissions에서 `pages: write` 활성화 여부 확인

### 2. 로컬 빌드는 성공하는데 GitHub Actions에서만 실패

**원인**: Ruby/Bundler/플러그인 버전 차이

**해결**:

```bash
# 1. 로컬 Ruby 버전 확인
ruby --version
# 예상: 3.2+

# 2. Gemfile.lock 재생성 (의존성 최신화)
bundle update

# 3. 깨끗한 빌드 시도
rm -rf _site/
bundle exec jekyll build

# 4. Actions 로그와 비교
# "Installing jekyll X.X.X" 버전 확인
```

---

## 포스트 및 콘텐츠 문제

### 3. 새 포스트가 배포 후 보이지 않음

**확인 체크리스트**:

- [ ] **날짜**: Frontmatter의 `date`가 현재보다 과거인가?
  ```yaml
  date: 2026-02-16 10:00:00 +0900  # 현재 이전 필수
  ```

- [ ] **레이아웃**: `layout: post` 확인
  ```yaml
  layout: post  # 이 행 필수
  ```

- [ ] **파일명**: `_posts/YYYY-MM-DD-slug.md` 형식 확인
  ```
  _posts/2026-02-16-my-post.md  # ✓ 올바름
  _posts/my-post.md              # ✗ 날짜 없음
  ```

- [ ] **카테고리**: 비어있지 않은가?
  ```yaml
  categories: [unity, c#]  # ✓ 적어도 하나
  categories: []           # ✗ 빈 배열
  ```

**로그 확인**:
```bash
# 상세 로그로 포스트 처리 과정 확인
bundle exec jekyll build --verbose | grep <post-filename>
```

### 4. Frontmatter YAML 오류

**증상**: "YAML front matter" 또는 "invalid Markdown" 오류

**원인**: 따옴표, 콜론, 들여쓰기 오류

**확인 및 수정**:

```yaml
# ✗ 잘못된 예
title: My Post Title with "quotes"
description: This is a description without quotes

# ✓ 올바른 예
title: "My Post Title with \"quotes\""
description: "This is a description without quotes"
```

**YAML 유효성 검사**:
- [yamllint.com](https://www.yamllint.com/)에서 Frontmatter만 복사해서 검증

### 5. 포스트의 이미지가 깨져서 표시됨

**증상**: 포스트는 보이지만 이미지가 로드되지 않음

**원인**: 이미지 경로 오류

**해결**:

```markdown
# ✗ 잘못된 경로들
![alt](images/image.jpg)
![alt](/my-post/image.jpg)
![alt](../assets/image.jpg)

# ✓ 올바른 경로
![alt](/assets/post-slug/image.jpg)
![alt]({{ site.baseurl }}/assets/post-slug/image.jpg)
```

**파일 위치 확인**:
```
assets/
  post-slug/
    image.jpg ← 이 파일이 실제로 존재하는가?
```

### 6. 카테고리/태그 아카이브가 보이지 않음

**원인**: jekyll-archives 플러그인이 Archives 페이지를 생성하지 못함

**확인**:

```bash
# 빌드 후 archive 디렉터리 확인
ls -R _site/archives/

# 예상 결과:
# _site/archives/
#   2026/
#     02/index.html
#   unity/index.html
#   retrospect/index.html
```

**만약 빈 폴더라면**:
- `_config.yml`에서 jekyll-archives 플러그인 활성화 여부 확인
- `_layouts/archive.html` 파일이 존재하는지 확인

---

## 디자인 및 렌더링 문제

### 7. 사이트가 모바일에서 제대로 보이지 않음

**원인**: CSS 미디어 쿼리 미적용, viewport 설정 값

**확인**:

```bash
# Chrome DevTools에서 확인 (F12 > Toggle device toolbar)
# width < 720px에서 폰트/레이아웃이 조정되는지 확인
```

**파일 확인**:
- [assets/css/styles.scss](assets/css/styles.scss) → 미디어 쿼리 섹션

### 8. 스타일이 배포 후 적용되지 않음

**원인**: CSS 캐싱

**해결**:

```
1. 검색 엔진의 캐시 무시 (Ctrl+Shift+R 또는 Cmd+Shift+R)
2. 또는 시크릿 창에서 다시 방문
3. GitHub Pages 캐시 (최대 5분, 자동 해소)
```

---

## SEO 및 메타데이터 문제

### 9. 검색 엔진에 포스트가 보이지 않음

**확인 체크리스트**:

- [ ] **Sitemap 확인**: [rumaniel.github.io/sitemap.xml](http://rumaniel.github.io/sitemap.xml)에 포스트 포함 여부
  - jekyll-sitemap이 설치되어 있는가?
  - `_config.yml`에서 플러그인으로 활성화했는가?

- [ ] **Robots.txt**: Sites가 크롤링을 차단하지 않는가?
  - GitHub Pages는 기본 robots.txt 안 제공 (차단 없음)

- [ ] **Canonical URL**: OG 메타 자동 생성 확인
  - `_includes/head.html` → jekyll-seo-tag 포함 여부
  - `url` 설정값이 실제 도메인과 일치하는가?

- [ ] **시간**: Google 색인 갱신은 수시간~수일 소요
  - [Google Search Console](https://search.google.com/search-console/)에서 수동 제출 가능

### 10. OG(Open Graph) 메타 태그 누락

**증상**: SNS 공유 시 제목/설명/이미지가 보이지 않음

**확인**:

```bash
# 페이지 소스에서 확인 (Ctrl+U)
# 아래 태그가 <head>에 있는지 확인:
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">
```

**원인**: jekyll-seo-tag 미설치 또는 Frontmatter 누락

**해결**:
- `Gemfile`: `jekyll-seo-tag` 포함 확인
- `_config.yml`: plugins 목록에 활성화
- **또는** Frontmatter에 명시:
  ```yaml
  description: "SNS에 공유될 설명 (160자 이내)"
  ```

---

## 일반적인 Git/배포 문제

### 11. 커밋/푸시 실패: "refusing to allow an OAuth App..."

**원인**: Personal Access Token(PAT)에 필요한 스콥 누락

**해결**:

1. 새 PAT 생성: [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. 필수 스콕 포함: `workflow`, `repo`, `admin:org`
3. 토큰 복사 후 git 설정:
   ```bash
   git remote set-url origin https://<TOKEN>@github.com/rumaniel/rumaniel.github.io.git
   ```

### 12. 로컬 `bundle install` 실패

**증상**: "Bundler 버전 호환성" 또는 "gem 설치 실패"

**해결**:

```bash
# 1. Bundler 업그레이드
gem install bundler --latest

# 2. Gemfile.lock 재생성
bundle install --no-cache

# 3. 여전히 실패하면
rm Gemfile.lock
bundle install
```

---

## 배포 후 검증 체크리스트

새 변경사항 배포 후 항상 확인하세요:

- [ ] **홈페이지**: [https://rumaniel.github.io/](https://rumaniel.github.io/) 정상 로드
- [ ] **포스트 목록**: 최신 포스트 상위 노출
- [ ] **아카이브**: [/archives/](https://rumaniel.github.io/archives/) 년도/카테고리 정상
- [ ] **Sitemap**: [/sitemap.xml](https://rumaniel.github.io/sitemap.xml) 포스트 수 확인
- [ ] **About 페이지**: [/about/](https://rumaniel.github.io/about/) 정상
- [ ] **404 에러**: 존재하지 않는 페이지 방문 → `/404.html` 표시
- [ ] **모바일 (720px 미만)**: 폰트 및 레이아웃 조정 확인

---

## 막혔을 때

1. **로컬에서 재현 가능한가?**
   ```bash
   bundle exec jekyll build --verbose
   ```

2. **Actions 로그를 읽었는가?**
   - GitHub Actions > 해당 실행 > 각 job의 상세 로그 확인

3. **최근 변경 사항을 확인했는가?**
   ```bash
   git log --oneline -10
   ```

4. **문서를 다시 확인했는가?**
   - [post-writing-guide.md](post-writing-guide.md)
   - [local-development.md](local-development.md)
   - [deployment-runbook.md](deployment-runbook.md)

5. **GitHub 공식 문서**:
   - [GitHub Pages Guide](https://pages.github.com/)
   - [Jekyll Documentation](https://jekyllrb.com/docs/)

