# rumaniel.github.io

Personal Jekyll site powered by GitHub Pages + Actions.

## Requirements

- Ruby 3.2+ (Ruby 3.4 recommended)
- Bundler

## Quick start (local preview)

```bash
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000

### Build only

```bash
bundle exec jekyll build
```

### Preview drafts

```bash
bundle exec jekyll serve --drafts
```

## Use cases

### 1) Create a new post

**Location:** `_posts/`

**File name (multilingual):**
```
YYYY-MM-DD-your-post-slug.ko.md
YYYY-MM-DD-your-post-slug.en.md
```

> Note: language code is `ko` (not `kr`).

**KO example:**
```yaml
---
layout: post
title: "Jekyll 다국어 글 작성 가이드"
description: "KO/EN 포스트를 같은 permalink로 운영하는 방법"
date: 2026-03-10 10:00:00 +0900
categories: [web]
tags: [jekyll, polyglot, i18n]
lang: ko
permalink: /jekyll-i18n-writing-guide/
---

한국어 본문
```

**EN example:**
```yaml
---
layout: post
title: "How to Write Multilingual Posts in Jekyll"
description: "A practical guide for managing KO/EN posts with the same permalink"
date: 2026-03-10 10:00:00 +0900
categories: [web]
tags: [jekyll, polyglot, i18n]
lang: en
permalink: /jekyll-i18n-writing-guide/
---

English body
```

**Rules:**
- Keep `date`, `categories`, and `permalink` consistent across KO/EN pair files.
- Set `lang: ko` for Korean and `lang: en` for English.
- Write `description` separately for each language (do not auto-copy).

### 2) Create a new page (like About)

**Location:** repository root (same level as `about.md`)

**File name (multilingual):**
```
new-page.ko.md
new-page.en.md
```

**KO example:** `new-page.ko.md`
```yaml
---
layout: page
title: New Page
permalink: /new-page/
lang: ko
page_id: new-page
---

한국어 페이지 내용
```

**EN example:** `new-page.en.md`
```yaml
---
layout: page
title: New Page
permalink: /new-page/
lang: en
page_id: new-page
---

English page content
```

**Rules:**
- Use the same `page_id` for KO/EN page pairs.
- Keep the same `permalink` for both languages.
- The English URL becomes `/en/<permalink>/` automatically.

### 3) Add EN translation to an existing KO post

1. Find the existing KO file in `_posts/`.
2. Create an EN file with the same date/slug and `.en.md` suffix.
3. Copy front matter from KO, then update:
  - `title`, `description`, `lang: en`
  - Keep `permalink` identical to KO file
4. Translate body content.
5. Build and verify both URLs:
  - KO: `/your-permalink/`
  - EN: `/en/your-permalink/`

### 4) Add EN translation to an existing KO page

1. If the KO page has no `page_id`, add one first.
2. Create `.en.md` page file in repository root.
3. Set `lang: en` and same `page_id` and `permalink`.
4. Translate content and test:
  - KO: `/page/`
  - EN: `/en/page/`

### 5) Update navigation items

Navigation is controlled in:
```
_data/navigation.yml
```

Example:
```yaml
- title: About
  url: /about/

- title: Categories
  url: /categories/
```

Navigation links are automatically localized by Polyglot during build.

### 6) Categories archive

Category archive pages are generated at:
```
/archives/<category>/
```

The hub page is:
```
/categories/
```

If you add a new category in a post, it will appear automatically.

### 7) Validate multilingual output locally

```bash
bundle exec jekyll build
bundle exec jekyll serve --livereload
```

Check:
- KO pages: `/`, `/about/`, `/categories/`, `/archives/<category>/`
- EN pages: `/en/`, `/en/about/`, `/en/categories/`, `/en/archives/<category>/`
- Language toggle appears and switches correctly.
- `hreflang` links are present in page source.

## Tips

- Restart `jekyll serve` after changing `_config.yml`.
- Do not commit `_site/` (build output).

## Google Analytics (GA4)

1. Open `_config.yml` and set `google_analytics` to your GA4 measurement ID.

```yml
google_analytics: G-XXXXXXXXXX
```

2. Push to `master`.
3. Verify in browser source that `gtag/js?id=G-...` is present on production pages.
