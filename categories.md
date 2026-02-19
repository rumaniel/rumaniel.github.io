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
      <a href="{{ '/archives/' | append: category_slug | append: '/' | relative_url }}" class="category-card post-card">
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
