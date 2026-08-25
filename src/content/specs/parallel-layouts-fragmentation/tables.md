::: abstract

This document is part of the [Pushing Forward for CSS Print](https://nlnet.nl/project/CSS-Print/) project, funded through the [NGI0 Commons Fund](https://nlnet.nl/commonsfund/), established by [NLnet](https://nlnet.nl/). It’s a joint initiative from core contributors of [Paged.js](https://pagedjs.org/) ([@julientaq](https://github.com/julientaq), [@JulieBlanc](https://github.com/JulieBlanc)) and the [WeasyPrint](https://weasyprint.org/) team ([@grewn0uille](https://github.com/grewn0uille), [@liZe](https://github.com/liZe)).

The goal of this proposal is to harmonize and define more precisely the way fragmentation is done in some of the parallel layouts, namely grids, flex boxes and tables.

The document is split into 3 parts:
- a review of the current literature about fragmentation of parallel flows,
- high-level goals, with common challenges and differences between the different layouts,
- pseudo-algorithms for different cases.

We would be happy to discuss the whole fragmentation problems for these types of layouts. We can also discuss the specific solutions for each layout, and possibly split this huge issue into smaller ones.

*Originally published here:*
- *[https://github.com/css-print-lab/.github/issues/12](https://github.com/css-print-lab/.github/issues/12)*
- *[https://github.com/css-print-lab/.github/issues/13](https://github.com/css-print-lab/.github/issues/13)*

:::

# Research & Literature Review

Today, CSS specifications offer various mechanisms for creating complex layouts, such as grids, flexbox, and tables. However, when it comes to paginated media, the way these layouts transition from one page to another requires thorough examination. While some proposals have been made in the current specifications, they are not well-defined algorithmically, making them difficult to implement effectively. We aim to propose improvements to these specifications.

## Scope

Grid, flex, table and column layouts share a lot of problems related to paged media: the way we split lines and columns that include parallel items is not fully described by the Fragmentation specification or by the specifications of the layouts. The limitations are sometimes listed in the specification, and sometimes just omitted.

What we want to do is to:

- list the current information about these limitations;
- write a draft of the algorithms that handle breaks for the different layouts;
- propose this draft to the W3C;
- communicate about this draft to get feedback;
- integrate parts of this document into the related specifications.

There are other cases that are different and are not covered by this work, even if the choices done here could help solving these cases:

- breaks in floats and absolutely positioned elements are somehow covered by the fragmentation standard, even if some specific questions are not answered for paged media;
- breaks in monolithic boxes are forbidden by definition, but would sometimes be interesting to have;
- inline elements (including inline blocks, tables…) may be considered monolithic, even it we could use the break points of the content when the inline element is alone in the line.

## Current Specifications

To know which improvements we can propose, we have to list the different sources of information about the current break possibilities.

### Fragmentation

[Fragmentation](https://drafts.csswg.org/css-break-4/) includes a lot of standard information about breaks.

Chapter 2 is about terminology (fragmentation, box fragment, fragmentainer…), parallel fragmentation (including all cases described above in "Scope", covered or not by this work), and nested fragmentation. Parallel fragmentation, which includes the topics of our current work, is only described with a few paragraphs, but far from being fully specified.

Chapter 3 is about controlling breaks, defining `break-*`, `orphans` and `widows` properties. It contains values for pages, columns and regions, but regions are marked at-risk of being dropped. Flex and Grid are listed as having child to parent propagation exceptions, among other possible parallel layouts, but the exceptions are not detailed here.

Chapter 4 is about possible break points, forced and unforced breaks, and optimization of unforced breaks.

Chapter 5 is about special rules and details related to breaks: adjoining margins (with a new `margin-break` property introduced by Level 4), broken box extension to fill empty space, `box-decoration-break`, transforms. It also gives information about breaking into varying-size fragmentainers, which can be useful for paginated media.

### Paged Media

The [Paged Media module](https://drafts.csswg.org/css-page-3/) explains in Chapter 1 and Chapter 8 that fragmentation is handled by the Fragmentation module.

### Flexbox and Grid

The [Flexible box](https://drafts.csswg.org/css-flexbox/) and [Grid](https://drafts.csswg.org/css-grid-2/) modules use the same information structure for fragmentation. They include a chapter dedicated to fragmentation ([Flexbox Chapter 10](https://drafts.csswg.org/css-flexbox/#pagination), [Grid Chapter 13](https://drafts.csswg.org/css-grid-2/#pagination)). These chapters include an introduction that defines the general principles, and a sample of the fragmentation algorithm.

The introduction defines some rules that must be applied when breaking flex layouts, but "The exact layout of a fragmented flex/grid container is not defined in this level of Flexbox/Grid Layout."

The algorithm section begins with: "This informative section presents a possible fragmentation algorithm for flex/grid containers. Implementors are encouraged to improve on this algorithm and provide feedback to the CSS Working Group."

The rules for Flexbox cover:

- how `break-before` and `break-after` on flex items propagate to the flex container in both row and column flex containers;
- where break opportunities are in both row and column flex containers;
- how the available and consumed space is calculated for split flex items;
- cases when a flex container has no space for a flex item and must go to the next page;
- how broken multi-line/column flex containers may use fragments as their own, independent "stack" of lines/columns to ensure that order corresponds to what users expect.

The Flexbox algorithm section describes 4 algorithms that must be followed to break flex containers and flex items in 4 different cases: single-line, single-column, multi-line, multi-column. It contains sparse comments to explain the high-level goal of each algorithm.

The rules for Grid cover:

- `break-*` properties apply to grid containers;
- `break-before` and `break-after` on grid items propagate to the rows, and to grid containers for first/last rows;
- where break opportunities are;
- how the available and consumed space is calculated for split grid items.

The Grid algorithm section gives a "rough draft of one possible fragmentation algorithm" that "needs to be severely cross-checked with the Flex algorithm for consistency". The algorithm is much shorter than the Flex one, as there’s no single/multi and line/column distinction.

### Table

The [Table module](https://drafts.csswg.org/css-tables-3), advertised as "not ready for implementation", also contains a [Fragmentation chapter](https://drafts.csswg.org/css-tables-3/#fragmentation). This chapter contains a part about breaking rules, and a part about repeating headers/footers.

The rules for Table explain where breaks are allowed/forbidden, depending on the spanning cells, row positions, repeating headers/footers and `break-*` rules.

The part about repeating headers/footers explains when headers and footers have to be repeated at the top and bottom of each table fragment.

### Columns

The [Columns module](https://drafts.csswg.org/css-multicol/) covers fragmentation in different parts:

- Chapter 2 explains that the columns are fragmentation containers, and that page fragmentation introduces multiple "multicol lines";
- Chapter 5 explains that "The problem of breaking content into columns is similar to breaking content into pages", and give links to the Fragmentation specification for the `column` and `avoid-column` values of the `break-*` properties.

### Regions

The [Regions module](https://drafts.csswg.org/css-regions/) explains that it "follows the fragmentation rules defined in the CSS Fragmentation Module". As for columns, "break opportunities in the named flow fragment contained by the CSS Region are determined using the standard fragmentation rules."

Specific `region` and `avoid-region` values of `break-*` properties are quickly described, with links to Fragmentation (where they are marked "at-risk") for more information.

## Proposed Improvements

### Remarks

- We like the way information is currently split between modules.
- A lot of content is already written, waiting for feedback.
- Breaking problems of Columns and Regions are the same as the ones of page breaks.
- Breaking problems are the same for the Table and Grid layouts.
- Breaking problems of Flex are different from Table and Grid, and require different solutions for single-line, single-column, multi-line, multi-column.

#### Details

Fragmentation is a great module defining global rules, breaking points and concepts. It covers most of the problems we had in WeasyPrint to break single-flow layouts. Parallel flows are discussed a few paragraphs below.

Paged media, Columns and Regions are more or less specific variants of the generic breaking rules, applied to pages, columns and regions, with their `page`, `column` and `region` values. They don’t introduce extra break points or special cases, they just define what are their specific fragmentainers without changing the generic fragmentation rules.

In WeasyPrint, in the case of single-flow layouts inside columns, there’s been no real breaking problem. Regions are not supported.

Parallel flows introduced by floating or absolutely positioned elements are regularly problematic in WeasyPrint, and some questions are not solved in Fragmentation in my opinion. They caused real-life issues when breaking pages and columns, at multiple levels: implementation, algorithm, high-level breaking strategy, specification. Even if these problems are really interesting and important, I think that we shouldn’t try to solve them here.

Table and Grid layouts face the same high-level breaking problems. Their layout, before possible fragmentation, creates a grid of rows and columns, with cells that can span. This ideal layout uses different algorithms, that’s why Table and Grid are not the same, but at the end they define widths for columns and heights for rows, gaps between columns and rows, borders.

The high-level problem for both is to define how we want to break rows (in a vertical main block direction). We have constrains given by `break-*` rules, fixed min-/max-/heights and min-/max-/widths, break points between rows, etc. The goal is to define which rules are not respected in over-constrained cases, and to give an algorithm that breaks the cells in a way that respect constraints (in a user-friendly way, if possible). This algorithm can then be adapted to Table and to Grid.

Grid fragmentation has already been implemented in WeasyPrint, using a custom algorithm. The pseudo-algorithm in the specification is not perfect, and WeasyPrint’s implementation didn’t follow all its steps. The implementation is based on global rules of Fragmentation and specificities of Table, with some extra rules that had to be defined to solve real-world, complex cases. The overall idea behind these rules is quite easy to summarize, and most of them add can be adapted for Table. We didn’t write a theoretical algorithm yet.

The Flex layout is different. The 4 cases lead to different challenges, that’s why the specification offers 4 different algorithms. The lessons we’ll learn from Table and Grid may help to find solutions that are consistent with Grid and Table, respect constraints, and propose user-friendly default breaking results. We have fragmentation in Flex for really simple cases. The current algorithms of the specification are solid, even if they don’t cover all cases and can be improved.

### Proposed Improvements

#### TL;DR

- Don’t add anything to Fragmentation, Paged Media, Columns, Regions.
- Define high-level goals for Table and Grid.
- Write a breaking algorithm for Table.
- Write a breaking algorithm for Grid.
- Define high-level goals for Flex.
- Write a breaking algorithm for Flex.

#### Details

Fragmentation is referenced by all modules. Paged Media, Columns and Regions basically say that their problems are covered by Fragmentation, and we fully agree with that.

We should focus on Table, Flex and Grid, and only change these 3 modules, replacing their current Fragmentation chapters. There’s a lot of draft-quality but really useful content in these chapters, with open issues that we should solve.

Even if the overall ideas are more or less shared between layouts, the break algorithms are actually really different, and there’s no need to have a common source of information somewhere in the Fragmentation specification to explain these ideas. Of course, informal data could be useful to share ideas, but blog posts are probably better than a specification for this.

As explained above, we should first work on Table and Grid, on a common high-level algorithm that splits rows and columns, with drawn examples that cover complex cases. When this high-level algorithm is ready, we can write 2 detailed algorithms for Table and Grid, and propose to include them (and a short introduction) to replace their specific chapters about fragmentation.

We can then do the same for Flex.

# High-level Goals

## High-Level Goals for Tables and Grids

Tables and grids share a lot of high-level properties: they are composed of cells, displayed in a grid, possibly spanning multiple rows and columns. The order, the location and the size of each cell is determined during the layout, before the fragmentation step that can be done independently. To get a correct fragmentation, for both grids and tables, we can define the same global goals and use the same rules. Some of them are [already defined in the Grid specification](https://drafts.csswg.org/css-grid-2/#pagination) and can be adapted to work in a general situation.

To keep these rules as simple as possible, we use the words "grid", "row", "column" and "cell" for both grid and table layouts. The rules are defined here in a default context where the grid is split between pages, the block direction used for rows is top to bottom, and the inline direction used for columns is left to right. The terms used must be adapted accordingly for other contexts.

1. The `break-before`, `break-inside` and `break-after` properties on cells are propagated to their row. The `break-before` property on the first row and the `break-after` property on the last row are propagated to the row container. It means that breaks before, inside or after a cell must be considered as breaks before, inside or after its row. If a cell spans through multiple rows, `break-before` applies to the first row, `break-after` applies to the last row, and `break-inside` applies to all rows.
2. A forced page break in a cell puts the following content of the cell on then next page, but doesn’t affect the content of the next cells of the row, whose content’s layout must start on the current page.
3. When a grid is continued after a break, the vertical space available to its cells is reduced by the space consumed by grid fragments on previous pages. The space consumed by a grid fragment is the size of its content box on that page. If as a result of this adjustment the available space becomes negative, it is set to zero.
4. Class A break opportunities occur between rows, and between row groups.
5. Class C break opportunities occur between the first/last row and their containers, and between the first/last row group and the grid.
6. When a grid is continued after a page break, the vertical space available to its cells is reduced by the vertical space consumed by grid container on previous pages, minus the possible size of the empty space added to make the grid reach the page. The height consumed by a x container fragment is the height of its content box on that page. If as a result of this adjustment the available space becomes negative, it is set to zero.

The question of [repeated table headers and footers](https://drafts.csswg.org/css-tables-3/#repeated-headers) is orthogonal to these rules, and should be addressed separately.

## High-Level Goals for Flex

The flex layout shares properties with grids, but they have major differences that make them require very different rules:
- they’re not grids because they only have one main direction,
- their main direction is not always the block direction,
- they can allow or forbid their items to be split between multiple lines.

Depending on the main direction and the allowed splits, we actually have 4 cases whose high-level goals are different. That’s why we require 4 independent sets of rules: single row, multiple rows, single column, multiple columns.

The rules are defined here in a default context where the flex container is split between pages, the block direction is top to bottom, and the inline direction is left to right. The terms used must be adapted accordingly for other contexts.

The order of the flex items is the one used after the `order` property is resolved.

### Single Row

The goal is to break all the items at the same time, as if it was a grid row.

1. The `break-before` and `break-after` values on flex items are propagated to the flex container.
2. A forced page break in a flex item puts the following content of the flex item on then next page, but doesn’t affect the content of the next cells of the row, whose content’s layout must start on the current page.
3. When a flex container is continued after a break, the vertical space available to its flex items is reduced by the space consumed by flex container fragments on previous pages. The space consumed by a flex container fragment is the size of its content box on that page. If as a result of this adjustment the available space becomes negative, it is set to zero.
4. Class C break opportunities occur between the flex line and the flex container’s content edges.

### Multiple Rows

The goal is to break all the items in a row at the same time, as if it was a grid row. Breaks are also possible between lines.

1. The `break-before` and `break-after` values on flex items are propagated to its flex line. The `break-before` value of the first line and the `break-after` value of the last line are propagated to the flex container.
2. A forced page break in a flex item puts the following content of the flex item on then next page, but doesn’t affect the content of the next cells of the row, whose content’s layout must start on the current page.
3. When a flex container is continued after a break, the vertical space available to its flex items is reduced by the space consumed by flex container fragments on previous pages. The space consumed by a flex container fragment is the size of its content box on that page. If as a result of this adjustment the available space becomes negative, it is set to zero.
4. Class A break opportunities occur between sibling flex lines, and Class C break opportunities occur between the first/last flex line and the flex container’s content edges.

### Single Column

The goal is to break around and between flex items as if they were blocks.

1. The `break-before` values on the first item and the `break-after` values on the last item are propagated to the flex container.
2. Forced breaks before or after other items and forced breaks in all items are applied to the item itself.
3. When a flex container is continued after a break, the vertical space available to its flex items is reduced by the space consumed by flex container fragments on previous pages. The space consumed by a flex container fragment is the size of its content box on that page. If as a result of this adjustment the available space becomes negative, it is set to zero.
4. Class A break opportunities occur between sibling flex items, and Class C break opportunities occur between the first/last flex items and the flex container’s content edges.

### Multiple Columns

The goal is to render items in a column until they reach the bottom of the page, and then create a new column if vertical space is available. Forced page breaks force the remaining content to be rendered on the next page. Unforced breaks can’t split flex items between columns or between pages, unless a flex item doesn’t fit on a blank page.

0. Layout is done with maximum height set to honor the bottom of the page.
1. The `break-before` values on the first item and the `break-after` values on the last item are propagated to the flex container.
2. Forced breaks before or after other items and forced breaks in all items are applied to the item itself, and force all the content after to be rendered on the next page. Avoided page breaks before or after other items force the two items to be rendered on the same page.
3. When a flex container is continued after a break, the vertical space available to its flex items is reduced by the space consumed by flex container fragments on previous pages. The space consumed by a flex container fragment is the size of its content box on that page. If as a result of this adjustment the available space becomes negative, it is set to zero.
4. Class A break opportunities occur between sibling flex items, and Class C break opportunities occur between the first/last flex items and the flex container’s content edges.

# Pseudo-Algorithms

## Pseudo-Algorithm for Tables

The rules are defined here in a default context where the table is split between pages, the block direction is top to bottom, and the inline direction is left to right. The terms used must be adapted accordingly for other contexts.

Pre-fragmentation steps:
 
1. Do the layout of the table as if it was not fragmented. This step defines an *unfragmented table*.
2. If the page is not empty: if the `break-before` rule of the table (or the first header row, or one of its cells, or the first body row, or one of its cells) forces a break, go to the next page.

Fragmentation steps:

1. If the height of the header plus the height of the footer rows is greater than the remaining height in the page:

   1. If the page is empty: consider the header and the footer as normal rows for this algorithm.
   2. If the page is not empty: go to the next page and restart the fragmentation steps.

2. If the page is not empty: if the height of the *unfragmented table* is higher than the remaining height in the page, and if the `break-inside` rule on the table avoids a break, go to the next page and restart the pre-fragmentation steps.
3. If the height of the header plus the height of the footer, as determined by the *unfragmented table*, is lower than the remaining height in the page, remove the heights of the header and the footer from the remaining height in the page.
4. For each row of the table, skipping all the content rendered on previous pages:

   1. If the page is not empty (excluding the table header): if the `break-before` rule on the row (or one of the cells whose top position is in the row) forces a break, go to the next page and restart the fragmentation steps.
   2. Set the height of the row to its height defined in the *unfragmented table*, minus the *fragment height* of the row for its content already rendered.
   3. If the height of the row is lower than the [ROWMIN](https://drafts.csswg.org/css-tables-3/#ROWMIN) of the remaining content, then it is set to this ROWMIN. For this step, the *fragment height* of the content already rendered is removed from any height set on a cell.
   4. If the height of the row is higher than the remaining height:

      1. If the `break-inside` rule on the row (or one of the cells displayed in the row) avoids a break, and if the page is not empty (excluding the table header), go to the next page and restart the fragmentation steps.
      2. Render the content of the row cells, not overflowing the remaining height in the page.
      3. If one of the non-empty cells has no content rendered on the page, and if the page is not empty (excluding the table header), abort the rendering of the row, go to the next page and restart the fragmentation steps.
      4. Set the *fragment height* to the content height of the tallest cell, plus the previous *fragment height* of the row.
      5. Render the row with the content that fits.
      6. If the table doesn’t have a footer, increase the height of the broken cells, row, row group, table so that they fill the remaining height in the page.
      7. Render the footer.
      8. Go to the next page and restart the fragmentation steps.

   5. Render the row.
   6. If the `break-after` rule on the row (or one of the cells whose top position is in the row) forces a break, go to the next page and restart the fragmentation steps.


5. Render the footer.
6. If the `break-after` rule on the table (or the last footer row, or one of its cells, or the last body row, or one of its cells) forces a break, go to the next page.

## Pseudo-Algorithm for Grids

(This is a simplified version of the pseudo-algorithm for tables.)

The rules are defined here in a default context where the grid is split between pages, the block direction is top to bottom, and the inline direction is left to right. The terms used must be adapted accordingly for other contexts.

Pre-fragmentation steps:

1. Do the layout of the grid as if it was not fragmented. This step defines an *unfragmented grid*.
2. If the page is not empty: if the `break-before` rule of the grid (or one of the items whose top position is in the first row) forces a break, go to the next page.

Fragmentation steps:

1. If the page is not empty: if the height of the *unfragmented grid* is higher than the remaining height in the page, and if the `break-inside` rule on the grid avoids a break, go to the next page and restart the pre-fragmentation steps.
2. For each row of the grid, skipping all the content rendered on previous pages:

   1. If the page is not empty: if the `break-before` rule on one of the items whose top position is in the row forces a break, go to the next page and restart the fragmentation steps.
   2. Set the height of the row to its height defined in the *unfragmented grid*, minus the *fragment height* of the row for its content already rendered.
   3. If the height of the row is lower than the [min track sizing function](https://www.w3.org/TR/css-grid-1/#min-track-sizing-function) value of the remaining content, then it is set to this min track sizing function value. For this step, the *fragment height* of the content already rendered is removed from any height set on an item.
   4. If the height of the row is higher than the remaining height:

      1. If the `break-inside` rule on one of the items displayed in the row avoids a break, and if the page is not empty, go to the next page and restart the fragmentation steps.
      2. Render the content of the row items, not overflowing the remaining height in the page.
      3. If one of the non-empty items has no content rendered on the page, and if the page is not empty, abort the rendering of the row, go to the next page and restart the fragmentation steps.
      4. Set the *fragment height* to the content height of the tallest item, plus the previous *fragment height* of the row.
      5. Render the row with the content that fits.
      6. Increase the height of the broken items and grid so that they fill the remaining height in the page.
      7. Go to the next page and restart the fragmentation steps.

   5. Render the row.
   6. If the `break-after` rule on one of the items of the row forces a break, go to the next page and restart the fragmentation steps.

3. If the `break-after` rule on the grid forces a break, go to the next page.

## Pseudo-Algorithm for Flex Boxes

The rules are defined here in a default context where the flex container is split between pages, the block direction is top to bottom, and the inline direction is left to right. The terms used must be adapted accordingly for other contexts.

### Row Flex

Pre-fragmentation steps:

1. Do the layout of the flex container as if it was not fragmented. This step defines an *unfragmented flexbox*.
2. If the page is not empty: if the `break-before` rule of the flex container (or one of the items in the first row) forces a break, go to the next page.

Fragmentation steps:

1. If the page is not empty: if the height of the *unfragmented flexbox* is higher than the remaining height in the page, and if the `break-inside` rule on the flex container avoids a break, go to the next page and restart the pre-fragmentation steps.
2. For each row of the flex container, skipping all the content rendered on previous pages:

   1. If the page is not empty: if the `break-before` rule on one of the items of the row forces a break, go to the next page and restart the fragmentation steps.
   2. Set the height of the row to its height defined in the *unfragmented flexbox*, minus the *fragment height* of the row for its content already rendered.
   3. If the height of the row is lower than the [cross size](https://drafts.csswg.org/css-flexbox/#cross-sizing) of the remaining content, then it is set to the cross size. For this step, the *fragment height* of the content already rendered is removed from any height set on an item.
   4. If the height of the row is higher than the remaining height:

      1. If the `break-inside` rule on one of the items displayed in the row avoids a break, and if the page is not empty, go to the next page and restart the fragmentation steps.
      2. Render the content of the row items, not overflowing the remaining height in the page.
      3. If one of the non-empty items has no content rendered on the page, and if the page is not empty, abort the rendering of the row, go to the next page and restart the fragmentation steps.
      4. Set the *fragment height* to the content height of the tallest item, plus the previous *fragment height* of the row.
      5. Render the row with the content that fits, using positions and main sizes defined in the *unfragmented flexbox*. If an item reaches the bottom of the row in the *unfragmented flexbox*, its vertical position (if the top of the item is displayed on this page) or the height (if the top of the item is not displayed on this page) is adjusted so that the bottom of the item fragment is aligned with the bottom of the row.
      6. Increase the height of the broken items and flex container so that they fill the remaining height in the page.
      7. Go to the next page and restart the fragmentation steps.

   5. Render the row.
   6. If the `break-after` rule on one of the items of the row forces a break, go to the next page and restart the fragmentation steps.

3. If the `break-after` rule on the flex container forces a break, go to the next page.

### Single Column Flex

Pre-fragmentation steps:

1. Do the layout of the flex container as if it was not fragmented. This step defines an *unfragmented flexbox*.
2. If the page is not empty: if the `break-before` rule of the flex container (or its first item) forces a break, go to the next page.

Fragmentation steps:

1. If the page is not empty: if the height of the *unfragmented flexbox* is higher than the remaining height in the page, and if the `break-inside` rule on the flex container avoids a break, go to the next page and restart the pre-fragmentation steps.
2. For each item of the flex container, skipping all the content rendered on previous pages:

   1. If the page is not empty: if the `break-before` rule on the item forces a break, go to the next page and restart the fragmentation steps.
   2. Set the height of the item to its height defined in the *unfragmented flexbox*, minus the *fragment height* of the item for its content already rendered.
   3. If the height of the item is lower than the height of the remaining content, then it is set to the height of the remaining content. For this step, the *fragment height* of the content already rendered is removed from any height set on an item.
   4. If the height of the item is higher than the remaining height:

      1. If the `break-inside` rule on the item avoids a break, and if the page is not empty, go to the next page and restart the fragmentation steps.
      2. Render the items, not overflowing the remaining height in the page.
      3. If the item is not empty but has no content rendered on the page, and if the page is not empty, abort the rendering of the item, go to the next page and restart the fragmentation steps.
      4. Set the *fragment height* to the content height of the item, plus the previous *fragment height* of the item.
      5. Render the item with the content that fits.
      6. Increase the height of the broken item and flex container so that they fill the remaining height in the page.
      7. Go to the next page and restart the fragmentation steps.

   5. Render the item.
   6. If the `break-after` rule on the item forces a break, go to the next page and restart the fragmentation steps.

3. If the `break-after` rule on the flex container forces a break, go to the next page.

### Multi Column Flex

Pre-fragmentation step:

1. If the page is not empty: if the `break-before` rule of the flex container (or its first item) forces a break, go to the next page.

Fragmentation steps:

1. Set the flex container’s `max-height` to the minimum between (a) its original `max-height` value and (b) the remaining height in the page.
2. Do the layout of the flex container. Stop if the `break-before` or `break-after` property of an item forces a break.
3. If the page is not empty, and if an item overflows the flex container: abort the rendering of the flex container on this page, go to the next page and repeat the fragmentation steps.
4. Render the items that fit.
5. If some items are not rendered, restart the fragmentation steps starting with the first item that has not been rendered.
6. If all items are rendered, and if the `break-after` rule on the flex container forces a break, go to the next page.
