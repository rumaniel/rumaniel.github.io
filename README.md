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

**File name:**
```
YYYY-MM-DD-your-post-slug.md
```

**Example:**
```yaml
---
layout: post
title: "My First Post"
description: "Short summary for SEO"
date: 2026-02-18 10:00:00 +0900
categories: [unity, c#]
tags: [jekyll, github-pages]
---

Your content starts here.
```

### 2) Create a new page (like About)

**Location:** repository root (same level as `about.md`)

**Example:** `new-page.md`
```yaml
---
layout: page
title: New Page
permalink: /new-page/
---

Content goes here.
```

### 3) Update navigation items

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

### 4) Categories archive

Category archive pages are generated at:
```
/archives/<category>/
```

The hub page is:
```
/categories/
```

If you add a new category in a post, it will appear automatically.

## Tips

- Restart `jekyll serve` after changing `_config.yml`.
- Do not commit `_site/` (build output).
