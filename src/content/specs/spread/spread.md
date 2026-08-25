# CSS Page Spread Module



::: abstract

This document is a draft specification for the declaration of spread and full-page elements in paged media. This specification was written as part of the [*Pushing Forward for CSS Print*](https://nlnet.nl/project/CSS-Print/) project, funded through the [NGI0 Commons Fund](https://nlnet.nl/commonsfund/), established by [NLnet](https://nlnet.nl/). It's a joint initiative from core contributors of [Paged.js](https://pagedjs.org/) ([@julientaq](https://github.com/julientaq), [@JulieBlanc](https://github.com/JulieBlanc)) and the [WeasyPrint](https://weasyprint.org/) team ([@grewn0uille](https://github.com/grewn0uille), [@liZe](https://github.com/liZe)). The result of this work can be found on [CSS Print Lab's GitHub](https://github.com/css-print-lab).

This draft addresses:

- The concept of a **spread** as a native CSS layout unit in paged media;
- How to declare an element as a **full-page element**, removing it from the normal flow and placing it on its own page (`page-placement` property);
- How to declare an element as a **full-spread element**, extending it across two facing pages (`page-placement: spread`);
- How to declare a **spread float**, an element that spans two pages while allowing content to flow before and after it (extension of CSS Page Floats 3);
- The **`spread-gutter`** property on `@page` for fold compensation across a spread;
- Interactions with existing CSS paged media specifications.

:::

## Introduction

In print publishing, a spread is a fundamental unit of design and  refers to two facing pages visible simultaneously when a bound document is open. Publishers place photographs, illustrations, tables, maps, or decorative elements across both pages of a spread, or isolate content on a single dedicated page.

These layouts are commonplace in:

- Photography books and catalogues
- Magazines and editorial publications
- Scientific journals with large figures or data tables
- Art books and exhibition catalogues
- Maps, plans, and diagrams requiring maximum surface area
- (other example ?)

Despite how common these layouts are, CSS has no native mechanism to describe them. 

This proposal seeks to fill that gap with a minimal but complete set of CSS mechanisms that integrate cleanly with existing paged media specifications.


## Types of spread and full-page layouts

The following table distinguishes the main layout types this specification addresses:

| Layout type | Flow behavior | Page sharing |
|---|---|---|
| **Full-page element** | Removed from flow | Dedicated page, no other flow content |
| **Full-spread element** | Removed from flow | Dedicated spread (two pages), no other flow content |
| **Spread float** | Stays in flow; content flows before and after | Shares two-page spread with surrounding content |
| **Page float** (top/bottom) | Stays in flow | Shares single page with surrounding content (already in [CSS Page Floats 3](https://www.w3.org/TR/css-page-floats-3/)) |




## Existing W3C Specifications

### CSS Paged Media Module Level 3 (css-page-3)

[CSS Paged Media 3](https://www.w3.org/TR/css-page-3/) defines the `@page` rule, named pages (via the `page` property), and the page box model. The `page` property allows associating an element with a specific named page type:

```css
figure { page: full-bleed; }
@page full-bleed { margin: 0; }
```

However, the `page` property does not remove the element from flow (eventually leaving an unwanted space on the page before the figure), does not isolate it on a dedicated page, and provides no mechanism to span two pages. The concept of a spread is entirely absent from this specification.

### CSS Generated Content for Paged Media Module (css-gcpm-3)

[css-gcpm-3](https://www.w3.org/TR/css-gcpm-3/) introduces `position: running()`, which removes elements from the flow for placement in page margin boxes (running headers, footers, etc.). This mechanism handles repeated content; it has no concept of placed content on a dedicated page or spread.

### CSS Page Floats Module Level 3 (css-page-floats-3)

[CSS Page Floats 3](https://www.w3.org/TR/css-page-floats-3/) extends the `float` property with new values (`top`, `bottom`, `inline-start`, `inline-end`, etc.) and introduces `float-reference` (`inline | column | region | page`). This allows elements to float to the top or bottom of a page while remaining in the flow.

This specification is the closest existing mechanism to what we need. However, it does not:
- Define a spread as a possible `float-reference` value;
- Define a full-page float (an element taking over the entire page content area);
- Handle the physical fold and gutter of a bound document.

### Gap in the specifications

No current W3C specification defines:
1. The spread as a CSS layout unit;
2. A mechanism to place an element on a dedicated full page;
3. A mechanism to spread an element across two facing pages;
4. Gutter/fold compensation for spread elements via a dedicated `@page` property.





## Terminology

- **Spread**: Two facing pages (a verso page and a recto page) that are visible simultaneously when a bound document is open. A spread is a two-page layout unit.
- **Recto page**: The right-hand page of a spread. Recto pages carry odd page numbers in left-to-right scripts.
- **Verso page**: The left-hand page of a spread. Verso pages carry even page numbers in left-to-right scripts.
- **Gutter**: The inner margin area on each page adjacent to the binding. When an element spans a spread, the gutter runs through the center of the element.
- **Full-page element**: An element that occupies the entire content area of a single page and is removed from the principal flow. No other flow content appears on that page.
- **Full-spread element**: An element that occupies the content area of both pages of a spread and is removed from the principal flow. No other flow content appears on either page of that spread.
- **Spread float**: An element that spans both pages of a spread while remaining in the flow of the document; surrounding content flows before and after the element across the spread.
- **Page content area**: The area of the page box inside the page margin boxes, as defined in [css-page-3](https://www.w3.org/TR/css-page-3/#page-model).
- **Spread content area**: The union of the page content areas of the two pages of a spread. Its width is the sum of the two page content area widths. Its height is the height of one page content area (both pages share the same height in a spread).






## The `page-placement` property


We propose a new `page-placement` property to remove an element from the normal flow and place it on a specific page position. 

The choice to introduce a dedicated property (rather than extending `float`) is deliberate. The `float` property implies that the element remains in the flow and affects surrounding content. A full-page element is fundamentally different: it leaves the flow entirely and occupies its own page. Overloading `float` with this behavior would conflate two semantically distinct mechanisms.

### Syntax

```
Name:   page-placement
Value:  none | page | left | right | spread | <integer>
```

| Value | Description |
|---|---|
| `none` | Default. The element remains in the normal flow. |
| `page` | The element is removed from the flow and placed on the next available page. A new page is created for it. |
| `left` | The element is placed on the next available left page. |
| `right` | The element is placed on the next available right page. |
| `spread` | The element is placed across the next available spread. Both pages of the spread are dedicated to this element. |
| `<integer>` | The element is placed on the page corresponding to the given integer (1, indexed from the beginning of the document). |

The element is removed from the principal flow at its source position and reinserted into the page box (or spread) of the target page.

::: issue

**ISSUE (recto/verso vs. left/right values)**: The current values `left` and `right` use physical directions, while this specification adopts `recto`/`verso` as its primary terminology. Should the values be renamed to `recto` and `verso`?

`recto`/`verso` are logically direction-aware terms: in RTL documents (Arabic, Hebrew), the recto page is physically on the left, which the `left` value does not capture correctly. Using `recto`/`verso` would therefore be more correct across writing systems.

However, renaming would create an asymmetry with `@page :left` and `@page :right` in [css-page-3](https://www.w3.org/TR/css-page-3/), which this specification references throughout. Options:
- Replace `left`/`right` with `recto`/`verso` and accept the terminological gap with CSS Page 3;
- Add `recto`/`verso` as aliases alongside `left`/`right`;
- Propose renaming `@page :left`/`:right` to `@page :verso`/`:recto` as part of a broader alignment effort.

:::

### Examples

<!-- EXAMPLE 1 ---------------------------------------------------- -->

::: example numbered

**Full-page illustration on a left page**

```css
@page full-bleed {
    margin: 0;
}

figure.illustration {
  page: full-bleed;
  page-placement: left;
  width: 100%;
  height: 100%;
}

figure.illustration img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```

The figure is removed from the text flow and placed on the next available left page. A named page is created specifically with no margins; the figure fills the entire page  (The red dot indicates the figure's original location in the HTML code)

![](/images/full-page-left.png)

:::




<!-- EXAMPLE 2 ---------------------------------------------------- -->

::: example numbered

**Figure with an image and a caption on a right page**

```css
@page {
  margin: 20mm;
  @bottom-center{
    content: counter(page);
  }
}

figure.illustration-with-caption {
  page-placement: right;
  width: 100%;
  height: 100%;
}

figure.illustration-width-caption img {
  object-fit: cover;
  width: 100%;
  height: 90%;
}

figure.illustration-width-caption figpcation {
  height: 10%;
}
```

The figure is removed from the text flow and placed on the next available right page. The margins and their content are preserved.

![](/images/full-page-right.png)

:::



<!-- EXAMPLE 3 ---------------------------------------------------- -->

::: example numbered

**Element placed on a specific page**

Place a figure on a  given page. The element is removed from the flow and placed on page 4.

```css
figure#figa {
  page-placement: 4;
}
```

:::

::: issue

**ISSUE**: If page 4 already contains flow content, what happens? too complicated to implement ?

:::

If the target page number exceeds the last page generated by the normal flow, the user agent must insert blank pages to reach the target page. For example, if the document's flow produces content only up to page 25 and an element is declared with `page-placement: 52`, blank pages are inserted from page 26 to page 51, and the element is placed on page 52.

Blank pages inserted in this way carry no flow content. They are subject to `@page :left` and `@page :right` rules as usual (e.g., alternating page numbers in margin boxes still apply). 



## Interaction with the `page` property 

`page-placement` can be combined with the `page` property from css-page-3 to associate specific `@page` rules with the target page:

```css
@page full-bleed {
  margin: 0;
}

figure.full-bleed {
  page: full-bleed;
  page-placement: right;
  width: 100%;
  height: 100%;
}

figure.full-bleed img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```

When `page-placement: spread` is used together with a named `page`, the named page rules apply to both pages of the spread.


### Interaction with the `bleed` property

CSS Paged Media 3 defines a `bleed` property on `@page` that specifies the extent of the bleed area beyond the page box — the region where content can extend past the trim line for print production:

```css
@page {
  bleed: 3mm;
  marks: crop cross;
}
```

The bleed area is **outside** the page box. An element declared at `width: 100%` fills the page content area exactly up to the trim line; it does not extend into the bleed area automatically. To make an element bleed, the author must explicitly shift it outside the page box using negative relative position and a compensated width.



<!-- EXAMPLE 4 ---------------------------------------------------- -->

::: example numbered

**Full-page image with bleed on all four sides**

```css
@page full-bleed {
  margin: 0;
  bleed: 6mm;
  marks: crop cross;
}

figure.full-bleed {
  page: full-bleed;
  page-placement: right;
  width: calc(100% + 6mm);
  height: calc(100% + 6mm);
  position: relative; 
  left: -3mm;
  top: -3mm;
}

figure.full-bleed img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```

With `margin: 0` on `@page`, the content area equals the trim box. The relative position of `−3mm` on all sides pushes the figure outside the page box, and `calc(100% + 6mm)` extends it by `2 × 3mm` to fill the bleed area on both sides of each axis.


:::





::: issue

**ISSUE: Could we use the new `env()` specification for bleed ? https://drafts.csswg.org/css-env-1/ Like ` width: calc(100% + 2 * env(page-bleed));` where `env(page-bleed)` is the default value declared in `bleed`.

:::





### Interaction with `@page :left` and `@page :right`

In CSS Page 3, `@page :left` and `@page :right` allow different styles on verso and recto pages. Spread elements need to be aware of this distinction.

When `page-placement: spread` is used:

- The verso half of the spread element is rendered in the context of the `@page :left` box.
- The recto half is rendered in the context of the `@page :right` box.

The spread element's width resolves against the full spread content area: the combined width of both page content areas plus the two inner margins (the right margin of the left page and the left margin of the right page). The outer margins (the left margin of the left page and the right margin of the right page) remain outside the spread content area and continue to host page margin boxes such as page numbers and running headers.

Page numbers and generated content apply to both pages of the spread when margins are preserved.


<!-- EXAMPLE 5 ---------------------------------------------------- -->

::: example numbered

**Full-spread panoramic photograph**

```css
@page {
  margin: 20mm;
  @bottom-center{
   	content: counter(page);
  }
}

figure.panorama {
  page-placement: spread;
  width: 100%;
}

figure.panorama img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```

The figure occupies both pages of the next available spread, with margins (and counter pages) and no other flow content.

![](/images/spread-with-margins.png)

:::



::: issue

**ISSUE**: If a named `@page` rule applies to a spread, should the two pages of the spread be able to have different named page types (e.g., `@page left` and `@page right` independently), or does the named page type apply uniformly to both? The first option would require a mechanism to declare spread-specific page pairs, and page number placement.

:::



### Accessibility

When an element is moved to a different page by `page-placement`, its logical position in the document (and therefore in the accessibility tree) should remain at its source position. CSS reading-order hints to preserve the correct sequence for screen readers and other assistive technologies.




## [CSS Paged Media 3] The `spread-gutter` property

When an element spans two pages of a spread, whether as a full-spread element (`page-placement: spread`) or as a spread float (`float-reference: spread`), the physical binding of the document introduces a constraint: content near the fold may be hidden, compressed, or distorted. This is especially critical for photographs, maps, and other continuous visual content.

Authors need a way to declare a gutter compensation offset: an amount by which content is shifted outward from the fold on each page to preserve readability. We propose a `spread-gutter` property declared directly on `@page`.

### Syntax

```
Name:    spread-gutter
Value:   <length>
Initial: 0
Applies to: @page
```

`spread-gutter` specifies the offset applied to spread element content to compensate for the physical binding. A non-zero value shifts the visible content area of each page away from the fold by the given amount.

- On a left page, the element's content is shifted to the left by the `spread-gutter` value.
- On a right page, the element's content is shifted to the right by the `spread-gutter` value.


This property applies to all elements with `page-placement: spread` or `float-reference: spread` on matching pages.


A symmetric gutter is declared once on the base `@page` rule:

```css
@page { 
  spread-gutter: 10mm; 
}
```


Because `spread-gutter` is a `@page` property, it participates in the normal CSS cascade. `@page :left` and `@page :right` can declare independent values to compensate for asymmetric binding methods where one side of the fold hides more content than the other:

```css
@page :left  { 
  spread-gutter: 12mm; 
}

@page :right { 
  spread-gutter: 8mm;
}
```

Named pages are also supported:

```css
@page chapter { 
  spread-gutter: 8mm; 
}
```


<!-- EXAMPLE 6 ---------------------------------------------------- -->

::: example numbered

**Full-spread photograph with fold compensation**

```css
@page { 
  spread-gutter: 10mm; 
}

figure.panorama {
  page-placement: spread;
  width: 100%;
  height: 100%;
}

figure.panorama img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```

The `spread-gutter: 10mm` declaration shifts the image 10mm toward the outer edge on each page, so the 20mm zone at the center of the spread (10mm on each side of the fold) carries no critical visual content.

:::


::: issue

**ISSUE**: The `spread-gutter` property shifts content, but the element's physical box dimensions remain those of the full spread. Should `spread-gutter` behave like `padding` (reducing the content area) or like a rendering offset (keeping the box dimensions unchanged but offsetting what is visible)? 

:::




## [CSS Page Floats 3] The spread float 

Beyond full-page and full-spread elements, there is a common and important layout type where an element spans two pages but does not occupy them entirely. A classic example is a large panoramic photograph in a magazine: text flows above and below the image, which spans both the verso and recto pages of the spread at its position.

This is a spread float: an element that spans both pages of a spread while remaining in the document flow. Content flows before and after the element, but not beside it.

This behavior is a natural extension of CSS Page Floats 3: just as `float: top` with `float-reference: page` floats an element to the top of a page while content flows below, a spread float should be declarable by extending `float-reference` with a `spread` value. We include spread floats here as well, since their interactions with `@page` overlap with those of the `page-placement` property.

### Extension of `float-reference`

We propose adding `spread` as a new value of the `float-reference` property:

```
float-reference: inline | column | region | page | spread
```

When `float-reference: spread` is used, the element floats relative to the spread it belongs to, rather than a single page. The element spans the full width of the spread content area (i.e., the combined content areas of both pages and their inner margins).

Combined with the existing `float: top` or `float: bottom` values from CSS Page Floats 3:

- `float: top` with `float-reference: spread` places the element at the top of the spread; content flows below it on both pages.
- `float: bottom` with `float-reference: spread` places the element at the bottom of the spread; content flows above it on both pages.

The `width` property should be interpreted differently when `float-reference: spread` is used, compared to `float-reference: page`. A percentage on `float-reference: page` resolves against one page content area width; on `float-reference: spread` it should resolve against the spread content area width. When a spread float specifies `width: 100%`, this width resolves against the full spread content area (the sum of both page content areas and their inner margins). Alternatively, each half of the spread element could be clipped to its respective page content area.


::: issue

**ISSUE **: Several questions arise:

- Does the overflow portion push content on the facing page, or does it layer above/below it?
- Is overflow allowed in both directions (left → right and right → left)?

This issue is partially addressed by the `width` property, but it is unclear whether overflow is possible in both directions. If an image originally on the right page overflows onto the left page, the layout of the left page must be reconsidered. The fragmentation algorithms must account for the spread as a whole. Does this conflict with the fragmentation algorithms defined in the CSS Breaks module?

:::





### Examples


<!-- EXAMPLE 7 ---------------------------------------------------- -->

::: example numbered

**Panoramic photograph spanning a spread, with text flowing before and after**

```css
figure.spread-photo {
  float: top;
  float-reference: spread;
  width: 100%;
}

figure.spread-photo img {
  object-fit: cover;
  width: 100%;
  height: 120mm;
}
```

The photograph is floated to the top of the spread, spanning both pages. Text continues below the photograph on both left and right pages.

![](/images/float-top.png)

:::


<!-- EXAMPLE 8 ---------------------------------------------------- -->

::: example numbered

**Spread float at the bottom of two facing pages, with text flowing to the right**

```css
figure {
  float: bottom left;
  float-reference: spread;
  width: 80%;
}
```

The figure is placed at the bottom of the spread, spanning both pages. Text flows above it and to its right.

The width of the figure is calculated as follows:

`(page content area of verso page + inner margin of verso page + inner margin of recto page + page content area of recto page) × 0.8`

The figure starts at the outer edge of the left page.

 ![](/images/float-bottom.png)

:::



Interaction with the `page` property → see spread specification

Gutter → see spread specification




## Open questions



::: issue

**ISSUE (Multi-column interaction)**: How does `page-placement` interact with multi-column layouts? If a `figure` inside a multi-column container has `page-placement: spread`, does it leave the column flow entirely and occupy a full spread? Or should `page-placement` be restricted to elements in the page-level flow? We think it should be the first option.

:::

::: issue

**ISSUE (Overflow of placed element)**: What happens when the content of a full-page or full-spread element overflows its target page or spread? Options: (a) the overflow is clipped; (b) the overflow continues onto the next page or spread; (c) a user-agent warning is raised. For photographs, option (a) is usually appropriate; for text-heavy content, option (b) may be preferable. [→trop spécifique ?]

:::

::: tof

:::
