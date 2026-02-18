---
layout: page
title: Categories
permalink: /categories/
description: Browse articles by category
---

<div class="categories-hero">
  <h1 class="categories-title">Categories</h1>
  <p class="categories-subtitle">Browse all articles organized by topic</p>
</div>

<section class="categories-section">
  <div class="categories-grid">
    {% assign sorted_categories = site.categories | sort %}
    {% for category in sorted_categories %}
      {% capture category_name %}{{ category[0] }}{% endcapture %}
      {% capture category_posts_count %}{{ category[1] | size }}{% endcapture %}
      {% assign category_slug = category_name | slugify %}
      {% assign category_count_num = category_posts_count | plus: 0 %}
      <a href="{{ '/archives/' | append: category_slug | append: '/' | relative_url }}" class="category-card">
        <div class="category-content">
          <h3 class="category-name">{{ category_name | capitalize }}</h3>
          <span class="category-count">
            {{ category_count_num }}
            {%- if category_count_num == 1 -%} article{%- else -%} articles{%- endif -%}
          </span>
        </div>
        <div class="category-arrow">→</div>
      </a>
    {% endfor %}
  </div>
</section>

<style>
.categories-hero {
  margin: 2.5rem 0 2rem;
  padding: 2.5rem 2.75rem;
  border-radius: var(--radius);
  border: 1px solid var(--card-border);
  background: linear-gradient(140deg, #f8f8f8, #ffffff 70%);
  box-shadow: var(--shadow);
}

.categories-title {
  margin-bottom: 0.5rem;
  font-size: clamp(2rem, 4vw, 3rem);
  font-family: "IBM Plex Serif", "Times New Roman", serif;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.categories-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 1.1rem;
}

.categories-section {
  margin: 3rem 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--card-border);
  background: var(--card);
  box-shadow: var(--shadow);
  text-decoration: none;
  transition: all 0.3s ease;
}

.category-card:hover {
  border-color: var(--accent);
  box-shadow: 0 20px 50px rgba(47, 47, 47, 0.12);
  transform: translateY(-2px);
}

.category-content {
  flex: 1;
}

.category-name {
  margin: 0 0 0.6rem;
  font-size: 1.2rem;
  font-family: "IBM Plex Serif", "Times New Roman", serif;
  color: var(--ink);
  letter-spacing: -0.01em;
}

.category-count {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: #f7f7f7;
  color: var(--muted);
  font-size: 0.85rem;
}

.category-arrow {
  margin-left: 1rem;
  color: var(--accent);
  font-size: 1.3rem;
  font-weight: 500;
}

@media (max-width: 720px) {
  .categories-hero {
    padding: 1.75rem;
  }

  .categories-title {
    font-size: clamp(1.8rem, 8vw, 2.4rem);
  }

  .categories-subtitle {
    font-size: 1rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .category-card {
    padding: 1.25rem;
  }

  .category-name {
    font-size: 1.05rem;
  }

  .category-arrow {
    margin-left: 0.5rem;
  }
}
</style>
