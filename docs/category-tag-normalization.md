# Category/Tag Normalization Plan (Option C)

## Current Inventory

### Posts Analysis

| File | Current Categories | Current Tags | Status |
|------|-------------------|-------------|--------|
| 2019-12-07-scripting-2018.3.md | [unity, C#] | [unity, C#] | Duplicate |
| 2020-01-16-brotli.md | [unity, C#, webgl, brotli] | [unity, C#, webgl, brotli] | **Needs split** |
| 2020-02-16-linq.md | [unity, C#] | [unity, C#] | Duplicate |
| 2020-05-21-2d-basics.md | [unity, art] | [unity, art] | Duplicate |
| 2021-08-26-iap-review.md | [iap, appstore] | [iap, appstore] | **Not major cat** |
| 2021-11-01-csharp-depth.md | [C#] | [C#] | Duplicate |
| 2021-11-25-retrospect-turnover.md | [retrospect] | [retrospect, turnover] | Split ✓ |
| 2022-02-20-pkg-bug.md | [unity, c#] | [unity, c#] | Duplicate |
| 2022-04-10-math.md | [math] | [math] | Duplicate |
| 2022-06-26-retrospect-h1.md | [retrospect] | [retrospect] | Duplicate |
| 2023-08-31-textbook.md | [unity, c#] | [unity, c#] | Duplicate |

---

## Proposed Major Categories (Master List)

**Goal:** 5-8 canonical categories that classify content architecturally

```
1. Unity        (game engine, graphics, packages, debugging)
2. C#           (language features, best practices, libraries)  
3. Retrospect   (year reviews, career reflections)
4. Art          (2D/graphics design, visual topics)
5. Math         (algorithms, math concepts, education)
```

**Note:** `iap` and `appstore` are platform-specific details → move to tags

---

## Reassignment Plan

### Category Assignments

| File | Proposed Primary Category | Secondary (if needed) | Rationale |
|------|---------------------------|----------------------|-----------|
| 2019-12-07-scripting-2018.3.md | **Unity** | C# | Unity version-specific scripting |
| 2020-01-16-brotli.md | **Unity** | (none) | Unity build compression (remove webgl+brotli as categories) |
| 2020-02-16-linq.md | **C#** | (none) | C# language extension methods |
| 2020-05-21-2d-basics.md | **Unity** | Art | Game dev + visual (primary=Unity) |
| 2021-08-26-iap-review.md | **C#** | (none) | Deployment/app monetization but language-agnostic → move `iap, appstore` to tags only |
| 2021-11-01-csharp-depth.md | **C#** | (none) | C# language deep dive |
| 2021-11-25-retrospect-turnover.md | **Retrospect** | (none) | Career reflection |
| 2022-02-20-pkg-bug.md | **Unity** | C# | Unity package system + C# specific issue |
| 2022-04-10-math.md | **Math** | (none) | Math review content |
| 2022-06-26-retrospect-h1.md | **Retrospect** | (none) | Year review |
| 2023-08-31-textbook.md | **Unity** | C# | Game dev concepts from textbook |

---

## Tag Strategy (After Normalization)

**Keep existing tags but separate from categories:**

- **Per-post tags** (details, keywords):
  - `[webgl]` on brotli post
  - `[brotli]` on brotli post
  - `[iap, appstore]` on monetization post
  - `[turnover, career]` on retrospect post
  - `[2d-graphics, sprites]` on art post
  - `[linq, extension-methods]` on C# post
  - etc.

**Archives page:** Show **categories only** (for cleaner navigation)
**Post metadata:** Show **tags only** (for semantic details)

---

## Implementation Steps

1. ✅ **Audit** (current step) - Completed
2. **Update post frontmatter:**
   - Simplify categories → single major category each
   - Move technical details to tags
3. **Verify**: Rebuild and test `/archives/<category>/` pages
4. **Commit**: `docs: Normalize categories/tags (Option C)`
5. **Deploy**: Push to master

---

## Validation Checklist

After reassignment:

- [ ] `/archives/unity/` shows ~5 posts
- [ ] `/archives/c/` shows ~3 posts (`C#` slugify 결과)  
- [ ] `/archives/retrospect/` shows 2 posts
- [ ] `/archives/art/` shows 1 post (or none if merged into Unity)
- [ ] `/archives/math/` shows 1 post
- [ ] Single `/categories.md` hub page lists only these 5
- [ ] No `iap` or `appstore` in archives (only in tags)
- [ ] Homepage posts list rendered correctly
- [ ] No 404s when clicking category links

---

## Notes

- **Backward compatibility:** Old `/archives/` URLs will 404 (expected, not critical)
- **Future posts:** Follow this category taxonomy going forward
- **Tag growth:** Tags can grow freely without affecting navigation clutter
