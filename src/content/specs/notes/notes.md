::: abstract

This document is a draft specification for the creation and positioning of notes in both continuous and paged media. This specification was written as part of the [*Pushing Forward for CSS Print*](https://nlnet.nl/project/CSS-Print/) project, funded through the [NGI0 Commons Fund](https://nlnet.nl/commonsfund/), established by [NLnet](https://nlnet.nl/). It’s a joint initiative from core contributors of [Paged.js](https://pagedjs.org/) ([@julientaq](https://github.com/julientaq), [@JulieBlanc](https://github.com/JulieBlanc)) and the [WeasyPrint](https://weasyprint.org/) team ([@grewn0uille](https://github.com/grewn0uille), [@liZe](https://github.com/liZe)). The result of this work can be found on [CSS Print Lab’s github](https://github.com/css-print-lab).

This draft is based on:

- The `note()` value, that you can use in the content property to declare elements as notes;
- An extension of the `element()` value to place the element removed from the flow (i.e. the note) in a specific place of the same document,
- The `@note-area` at-rule that can be used to display notes in a page (for paged media only);
- Three syntactic proposals currently under discussion  to handle notes in continuous media

*Originally published here : [https://github.com/w3c/css-print/issues/3](https://github.com/w3c/css-print/issues/3)*
:::

*Discussed in the W3C CSS Working Group repository: [https://github.com/w3c/csswg-drafts/issues/12472](https://github.com/w3c/csswg-drafts/issues/12472)*


## Types of notes

For now, the W3C specifications only allow the creation of footnotes in paged media, as described in the [CSS Generated Content for Paged Media Module (css-gcpm-3)](https://www.w3.org/TR/css-gcpm-3/). But we know that designers and editors like to be able like to make use of all kinds of notes. You can find some examples here: [https://www.w3.org/XML/2015/02/footnote-examples/](https://www.w3.org/XML/2015/02/footnote-examples/). To name a few:


| Types of notes      |                                                              |
| ------------------- | ------------------------------------------------------------ |
| Footnotes           | notes placed at the bottom of the pages (paged media only)                      |
| Side notes          | notes related to the page content, grouped in the left or in the right of the page or content, alongside the text area |
| End notes           | notes grouped together in one place at the end of a document or at the end of a section of the document |
| Marginal notes      | notes that are placed to one side of a page (or document) or both sides at the exact vertical position of the note reference number |
| Column footnotes    | footnotes that can be placed according to the column in which they are located |
| Multiple notes area | not for pages that share footnotes, margin notes, column footnote, etc. |


## Specifications W3C

[A part](https://www.w3.org/TR/css-gcpm-3/#footnotes) of the CSS Generated Content for Paged Media Module (css-gcpm-3) is dedicated to footnotes. The first section defines [the terms](https://www.w3.org/TR/css-gcpm-3/#footnote-terms) of the footnote objects. These definitions can be applied to all types of notes, thus we’ll keep the same terms but removing the prefix “foot” for the rest of this issue discussion:

> **Note element**: The element containing the content of the note, which will be removed from the flow and displayed as a note.
>
> **Note marker**: (also known as note number): A number or symbol adjacent to the note body, identifying the particular note. The note marker should use the same number or symbol as the corresponding note call, although the marker may contain additional punctuation.
>
> **Note body** : The note marker is placed before the note element, and together they represent the note body, which will be placed in the note area.
>
> **Note callout** (also known as note reference): A number or symbol, found in the main text, which points to the note body.
>
> **Note area**: The page or document area used to display notes.
>
> **Note rule**: (also known as note separator): A horizontal rule is often used to separate the note area from the rest of the page. The separator (and the entire note area) cannot be rendered on a page with no notes.
>


The specification also describes how to create footnotes in a page with the following code:

```css
@page {
  @footnote {
    float: bottom;
    /* Style of footnote area */
  }
}

span.footnote {
  /* Display span as footnote */
  float: footnote;
}
```

This code also creates the special [footnote counter](https://www.w3.org/TR/css-gcpm-3/#footnote-counters) and special pseudo-elements for [footnote calls](https://www.w3.org/TR/css-gcpm-3/#footnote-call) (`::footnote-call`) and [footnote markers](https://www.w3.org/TR/css-gcpm-3/#footnote-marker) (`::footnote-marker`). The position, size and styles of the footnote area are defined by the `@footnote` declaration. The specification does not set precise limits, [only a couple of paragraphs and a lot of issues and unanswered questions](https://www.w3.org/TR/css-gcpm-3/#footnote-area). The advantage is that **we can do many proposals without conflicting with the current specifications.**

In [css-gcpm-3](https://www.w3.org/TR/css-gcpm-3/), there is this issue:

<!-- TODO: generate the reference to the issue -->
> Issue: Why is `float: bottom` used with the footnote area? Floating footnotes to the footnote area, and then floating the footnote area itself, seems overly complex, given that implementations don’t allow the footnote area to float anywhere else. Note that some implementations do allow the footnote area to be absolutely positioned. (https://www.w3.org/TR/css-gcpm-3/)

We agree that using double float declaration is complex. But a mechanism is needed to move the note element into a specific area of the page or the document. To do this, we can take inspiration from a mechanism already present in the draft of the paged media specifications, the [running element](https://www.w3.org/TR/css-gcpm-3/#running-elements): by adding the `position: running()` declaration, we can remove an element from the flow to reuse it in multiple places, perfect for the running heads of a book for example.

For the notes, we’d like to propose a new way to create and place notes, based on new values (`notes()` and `element()`) for properties already in the CSS specifications (`position` and `content`).



## Proposal: pattern to create notes

### Global pattern

Notes are always dependent on a principal flow, but they are out-of-flow elements, such as an aside. This is ancillary content that may be moved to the bottom of the page, to its margins, or to another section of the document. A note is created when the content is moved to a specific area of the document, leaving a reference indicator behind.

For all types of notes, we can see a pattern to build them:

1. Declare that an element of a flow is a note.
2. Remove the item from the flow.
3. Leave a note reference indicator in its place, which points to the moved note element - this is an explicit link from a location in the document to a note element.
4. Place the note element and its children in a special area with all the other notes of the page or the document, in the order of appearance in the flow.
5. Create a marker before the note that matches the note call.
6. Place the note area in the page or document with CSS layout facilities according to  a position scheme.
7. (If paged media) If the note overflows the note area, move the items to the next page in the equivalent area, according to note policy.



### Clarification about HTML elements

The W3C doesn't provide a dedicated way to tag notes in HTML. Some discussions in the mailing list of the W3C or WHATWG, or in blog articles, suggest different ways but none of them seem to have unanimous agreement.

#### In use

In the meantime, there are two most commonly used methods of adding notes:

- It's common to see link elements with `href` attrbute pointing to sections of a page with fragmented URLs. This mechanism provides some issues pointed out by [Greg Lowney](https://www.w3.org/Bugs/Public/show_bug.cgi?id=13666) in terms of accessibility. This also poses problems with more complex layouts. If the notes elements are presented in a list, it becomes necessary to transform the DOM to place them in the manner of a side note, end notes or footnotes (both for continuous and/or paged media).
- Another way would be to use some `<span>` elements directly in paragraphs to encapsulate note elements in the place where they appear. This is the method used in examples in the [css-gcpm-3 draft](https://www.w3.org/TR/css-gcpm-3/#creating-footnotes).

#### In unofficial specifications
David MacDonald and Shane McCarron propose specifics `<note> `, `<notegroup>`and `<refnote>` elements in some [unofficial specifications](http://spec-ops.github.io/html-note/index.html). One part of the document presents [uses cases and a lot of requirements](http://spec-ops.github.io/html-note/index.html#UCnR) that are very useful. However, we believe that many of the HTML syntaxes proposed in the document can be best achieved through CSS mechanisms.

#### What we’d like to have

Therefore, we propose to use only one `note` element.

A `note` element represents a note, e.g. a secondary content that is related to other content in the document. It’s a self-contained node that gives the information about where a note starts and where it ends. The `note` element must be placed where the note appears in the content flow. This is a new type of HTML element which has the following properties:

- The note element is a block type element constituted by the opening `<note>` and closing `</note>` tags. Any content between those two tags is part of the content of the note.
- The note element must be contained into another HTML element that accepts flow content, meaning that the `note` element can be the child of any [grouping content element](https://html.spec.whatwg.org/multipage/grouping-content.html#grouping-content) or heading element.
- The `note` element accepts other block or inline elements such as paragraphs, table, images, list, etc.
- A `note` element can be a child of another `note` element.
- The `<note>` element accepts all the global attributes.
- In continuous media, the user agent must give the user the possibility to show or hide the `<note>` element to read it when they want.

The following example is a conforming HTML fragment:

<!-- 
```HTML
<p>Gutenberg  in 1439 was the first European to use movable type.
Among his many contributions to printing are: the invention of
a process for mass-producing movable type; the use of oil-based
ink for printing books; <note>Soap, Sex, and Cigarettes: A Cultural
History of American Advertising By Juliann Sivulka, page 5</note>
adjustable molds; mechanical movable type; and the use
of a wooden printing press similar to the agricultural
screw presses of the period.</p>
```
-->

![](/images/example-html-note.png "HTML code with note tag")

This potential new HTML element is easy to use and allows a note to be always attached to the content it adds details to. This proposal is aligned to the way HTML works (a node mechanism) without adding an HTML element that would depend on another one (to create note references for example).

Until this element exists in HTML, a `span` element will be used with a class named “note” for illustrative purposes.


## Create notes with CSS

A mechanism is needed to move the note element into a specific area of the page or of the document, and leaving a reference indicator in its place. To do this, we add the `note()` value to the position property and the `element()` value to the content property.

### The 'note()' value

The `note()` function removes the element (and associated `::before` and `::after` pseudo-elements) from the principal flow, and makes it available to place in a page margin-box, a page note-area `@note-area` or a `::note-area` pseudo element using `element()`. The element inherits from its original position in the document, but is not rendered there, instead a `::note-call` pseudo-element is created and inserted in the original position of the note. The elements keep their defined styles.
A custom identifier is required: `note(<custom-ident>)`. If there is no `element()` value corresponding to the custom identifier of the `note()` value, the elements are not removed from the flow and are shown as inline `note` elements.

### The 'element()' value

To place the elements removed from the flow in a specific place on the document or page, we can use the function `element()` already present in the specifications and usable in a `content` property.

> The `element()` value of the content property places an element (which has been removed from the normal flow via `running()`) in a page margin box. Whenever the value of the element changes, the value of `element()` is updated. \
> Just as with `string()`, `element()` takes an optional keyword to describe which value should be used in the case of multiple assignments on a page. User agents must be able to recall many values, as `element()` can return past, current, or future values of the assignment. [https://www.w3.org/TR/css-gcpm-3/#element-syntax](https://www.w3.org/TR/css-gcpm-3/#element-syntax)

A custom identifier is required (same as the corresponding `note()` function): `element(<custom-ident>)`.

#### The keyword `all-once`

To make `element()` work with `note()`, a specific behaviour needs to be added that can be declared via an optional keyword `all-once`.

With the keyword `all-once`, the value of all the assignments of the document or the page are used; i.e. all the note elements (which have been removed from the normal flow via `note()`) are displayed in the new area where they're assigned. Each element from `note()` value is displayed in the same order of the flow and has only one assignment in the document or in the page (the elements are not repeated). The value may be empty if there is no note element on the page.

`element() = string(<custom-ident>, all-once)`



### Using in `@note-area`

The `element()` function can be used  in new page area `@note-area` (see [*Page note area*](#page-note-areas-(%40note-area))).

::: example numbered

**Notes in page note area**

```css
note.note {
  position: note(<custom-ident>);
}

@page {
  @note-area {
    content: element(<custom-ident>, all-once);
  }
}
```
:::

### Using in margin boxes

Using the `element()` function, the margin-boxes can now receive the content of the `note` elements.

The [dimensions](https://www.w3.org/TR/css-page-3/#margin-dimension) and (default) [properties](https://www.w3.org/TR/css-page-3/#page-margin-property) of a margin box work as described in [CSS-page-3](https://www.w3.org/TR/css-page-3/). The size of the note area does not affect the content page area.


::: example numbered
**Notes in page margin box**

The following rules result in the placement of the note elements inside the left-top margin box. Margin and text alignment of the note elements are set to the note element itself and padding of the margin box is set in `@left-top` at-rule.

```css
@page {
  @left-top {
    content: element(sidenote, all-once);
    padding: 5mm;
  }
}

note.sidenote {
  position: note(sidenote);
  margin-bottom: 10px;
  text-align: left;
}
```

![an example of a layout with notes in the margin on the left side of the page](/images/81831445-a579fb80-953d-11ea-9a59-d9f00271cd9d.png "A classic use of side note in the margin of the page")

:::


::: issue

**ISSUE**: In [css-gcpm-3](https://www.w3.org/TR/css-gcpm-3/), the default value of the second argument of the `element()` function is `first`. However, when notes are created from the `note()` function, this should be the value `all-once` by default. How do you indicate this?

**ISSUE**: If the other arguments of the function `element()` are declared (`first`, `first-except`, `last`, `start`), what does that do for the note elements?

:::

### The note counter

*This section and follows contains some specifications of [css-gcpm-3](https://www.w3.org/TR/css-gcpm-3/).*

The note counter is a predefined [counter](http://dev.w3.org/csswg/css-lists/#counter) associated with the note element. Its value is the number or symbol used to identify the note. This value is used in both the note call and the note marker. It should be incremented for each note.

By default, note counters use a predefined [counter](http://dev.w3.org/csswg/css-lists/#counter) with the same name (`<custom-ident>`) as the one used in `note()`. You don’t need to declare `counter-reset` or `counter-increment` unless you want to customize their behavior.

::: example numbered

In the example below, sidenotes are reset at the beginning of each section.

```css
section{
    counter-reset: sidenote 0;
}
note.sidenote{
    position: note(sidenote);
}
```

In the example below, footnotes increment by 2 instead of the default value of 1.

```css
note.footnote{
    position: note(footnote);
    counter-increment: 2;
}
```

:::

The note counter, like other counters, may use any [counter style](http://dev.w3.org/csswg/css-counter-styles-3/#counter-style). Notes often use a sequence of symbols.

```css
::note-call { content: counter(footnote, symbols('*', '†', '‡', '§')); }

::note-marker { content: counter(footnote, symbols('*', '†', '‡', '§')) '. '; }
```

The note counter can be reset on each page:

```css
@page {
  counter-reset: note;
  @note-area { … }
}
```

Note that the value of the note counter should depend on the position of the note element in the document tree, not where it is eventually placed. A note element may sometimes be placed on the page after the note call, but the same counter value must be used for both.



### The `::note-call` pseudo element

A `::note-call` pseudo-element is inserted in place of the `note` element when the latter is removed from the flow. By default, the content of this pseudo-element is the value of the note counter, styled as a superscripted number. It must act like an anchor.

```css
::note-call {
  content: counter(note);
  vertical-align: baseline;
  font-size: 100%;
  line-height: inherit;
  font-variant-position: super;
}
```



### The `::note-marker` pseudo element

The `::note-marker` pseudo-element represents the note element’s marker, the number or symbol that identifies each note. This pseudo-element behaves like a `::marker` pseudo-element, as defined in [[CSS3LIST\]](https://www.w3.org/TR/css-gcpm-3/#css3list). It is placed at the beginning of the parent’s content, and is inline by default. The `::note-marker` can be styled just as other `::marker` elements can be. The default style should include `list-style-position: inside`, or be set as any other list.

```css
::note-marker {
  content: counter(note) '. ';
}

```
### The ::note-callback pseudo element

The `::note-callback` pseudo-element represents the note element's call back, e.g. a navigation back from a note that returns to the correct associated `::note-call`. It is placed at the end of the superior parent’s content, and is inline by default. By default, the content of this pseudo-element is the Leftwards Arrow with Hook Unicode Character (“↩” U+21A9). It must act like a link.

```css
::note-callback {
  content: '↩';
}
```

::: issue 


**ISSUE** Mostly useful for continuous media. Should we mention that by default it doesn’t show up in paged media? But, paged media isn’t always meant for print… Thoughts?

:::

### Support for multiple note types

Notes call and maker can be used either at the parent element level or at the note element level, allowing different types of notes within the same section.

::: example numbered


```css
note.sidenote{
    position: note(sidenote);
}

note.footnote{
    position: note(footnote);
}

note.sidenote::note-call {
    /* will affect all the note with a class `sidenote`*/
}

note.footnote::note-call {
    /* will affect all the note with a class `footnote`*/
}
```


:::


## Page note areas (`@note-area`)

The `@note-area` at-rule creates special [page areas](http://dev.w3.org/csswg/css-page/#page-area) that can be used to display notes elements via the `element()` function. Those areas, called “page note areas”, are created within the [page context](https://www.w3.org/TR/css-page-3/#page-context), which is the [declaration block](https://www.w3.org/TR/CSS21/syndata.html#x14) of the [@page](https://www.w3.org/TR/css-page-3/#at-ruledef-page) rule. This rule defines a box that, if used, will contain the corresponding note elements that appear on that page and move by generated content properties for notes. Since note areas are in the context page, note boxes are contained in the content area of a page box.

The `@note-area` may be following by a custom identifier.

The properties of a note box are determined by properties declared in the note rules. These properties can be used to define:

- positioning scheme of the note box,
- size of the note box,
- note policy,
- General styling of the note box (each note boxes has its own margin, border, padding and content areas.)

If the content of a note area overflows from the box, it will go to the next page, in the same note area (see [*Notes policy*](#notes-policy)).


### Positioning schemes of note area

Any of the CSS layout facilities can be used to create, position and size note areas: float, absolute positioning, grid, exclusion, etc.

::: example numbered

Using float on the page and negative margins can be helpful in creating a note area half on margin, half on text content.

```css
@page {
  @note-area {
    content: element(sidenotes, all-once);
    float: top right;
    float-reference: page;
    width: 42mm;
    margin-right: -30mm;
  }
}

note.sidenote {
  position: note(sidenotes)
}
```

![An image of a layout of a page where the margin note is wrapped in the text](/images/81831585-d1957c80-953d-11ea-938d-9f6ce8ca6bd4.png "Note wrapping using floating note area")

:::

::: example numbered

Since a note area is a box, it’s possible to layout the area itself (with columns for example).

```css
@page {
  @note-area {
    content: element(notes, all-once)
    float: bottom right;
    float-reference: page;
    width: 50%;
    columns: 2;
  }
}

note.notes {
  position: note(notes);
}

```

![An image of a layout where the notes are wrapped at the bottom of the page, taking half the size of the full column](/images/81831630-dfe39880-953d-11ea-89c4-4873cc7c72e9.png "A bottom-right floating note area divided in columns")

:::



Default values of properties for `@note-area`:

```css
@note-area {
  float: bottom;
  float-reference: page;
  width: 100%;
  max-height: 80%;
}
```



### Float notes (`float` and `float-reference`)

[CSS Page float](https://www.w3.org/TR/css-page-floats-3/) adds some values to the `float` property to position elements in a page context, and proposes [ `float-reference` property](https://www.w3.org/TR/css-page-floats-3/#propdef-float-reference) to indicate the “reference container” for a floated element. We will make extensive use of these properties in the following examples.

####  The `float-reference` property

> Name:	`float-reference`
> Value: inline | column | region | page
> (...)
>
> `inline`
> The float reference is the line box of the float anchor. (...)
>
> `column`
> The float reference is the column in a multi column environment in which the float anchor is placed.
>
> `region`
> The float reference is the region in a region-chain within which the float anchor is placed. (...)
>
> `page`
> The float reference of the float is the page within which the float anchor is placed. (...)


::: example numbered

**Marginal notes on the left margin of the page**

In this example, we use the `inline` value of the `float-reference` property. This allows the creation of marginal notes, i.e. notes placed to one side of the text, with the first line of the note body aligned with the line in the main flow that contains the note call.

```css
@page {
  @left-top {
    content: element(refs, all-once);
    float: left;
    float-reference: inline;
    margin-left: -50mm;
    width: 50mm;
  }
}
note.refs {
  position: note(refs);
}

```
With float, using `clear: left` is a simple solution to avoid collisions of marginal notes.

:::



::: issue

**ISSUE**: We need to specify the algorithm that avoids collisions. Also, what if the marginal note overflows the page, how do we indicate that it can be moved up?

:::

#### Extentions of the `float` property

[CSS Page float](https://www.w3.org/TR/css-page-floats-3/) propose some extentions of the `float` property.

> Name:	`float`
>
> Value: left | right | top | bottom

Values can be added together:

```
float: top right;
```

::: issue

**ISSUE**: Further definitions and examples are required to block-start | block-end | inline-start | inline-end | snap-block | snap-inline | none

**ISSUE**: Does the `clear` property can work with this proposal?

:::


### Notes for multi-column layout

In a multi-column layout, note elements may have to be displayed at the bottom of each column. This means that multiple note areas might have to be created for the same fragmented flow. This layout creates some issues:

- The (foot)notes are not in a page context since the column properties are applied on an element contained in the page area and not to the page area itself.
- Because a column is an anonymous box, there is currently no way in CSS to target a particular column of a multi-column element.

[CSS Page float](https://www.w3.org/TR/css-page-floats-3/) proposes the [ `float-reference` property](https://www.w3.org/TR/css-page-floats-3/#propdef-float-reference) to indicate the “reference container” for a floated element. The value `column` indicates that the float reference is the column in which the floated element is placed in a multi column environment.

We can use this reference to indicate the creation of note areas in the columns of the page where the note appears. As many boxes as necessary are created on each column. All the note areas have the same properties and can be targeted by one `@note-area` rule only.


::: example numbered

```css
@page {
  @note-area {
    content: element(notes, all-once);
    float: bottom;
    float-reference: column;
  }
}

#content {
  columns: 3;
}

#content note.notes {
  position: note(notes);
}
```

![](/images/81831785-128d9100-953e-11ea-8309-c4964154014a.png "An example of notes for multi-column layout")

:::



### Multiple notes areas in a page

There are already a lot of use cases in critical editions where you can find multiple kinds of notes (bibliographical references, explanations, etc.) The `@note-area` at-rule declaration make multiple notes easier by mixing multiple note areas in the same page context.


::: example numbered

**Multiple note areas in the same page**

```css
@page {
  @note-area refsA {
    content: element(refsA, all-once);
    float: bottom left;
    float-reference: page;
    width: 30mm;
    margin-left: -12mm;
  }
  @note-area refsB {
    content: element(refsB, all-once);
    float: bottom right;
    float-reference: page;
    width: 60mm;
    columns: 2;
  }
}

note.refsA {
  position: note(refsA);
}

note.refsB {
  position: note(refsB);
}
```

![A layout where three different column of notes are wrapped around the content](/images/81831697-f853b300-953d-11ea-8a06-e06abeb3ed0f.png "An example of the possible layout mixing multiple note areas and float")


:::



::: example numbered

**Footnotes and marginal notes in the same page**


```css
@page {
  @note-area {
    content: element(refs, all-once);
    float: left;
    float-reference: inline;
    margin-left: -50mm;
    width: 50mm;
  }
  @bottom-left {
    content: element(footnotes, all-once);
    width: 100%;
    vertical-align: bottom;
  }
}

note.refs {
  position: note(refs);
}

note.footnotes {
  position: note(footnotes);
}
```

![A layout of a page where margin notes and footnotes are together on the page](/images/81831743-04d80b80-953e-11ea-986f-17103694a6ca.png "Mixing margin notes and footnotes for semantics notes")
:::



### @footnote special at-rule

[css-gcpm-3](https://www.w3.org/TR/css-gcpm-3/) defines a special`@footnote` rule. This rule can be kept in this specification as a specific `@note-area` with predefined positioning scheme. It behaves like a floated bottom page element. No positioning scheme designed by the user is taken into account in this `@footnote` rule, and only one footnote box can be created on a page.

::: example numbered

```css
@page {
  @footnote {
    content: element(footnotes, all-once);
  }
}

note.footnote {
  position: note(footnote);
}
```

![Two layouts showing the default setup for footnotes](/images/81831829-20431680-953e-11ea-9df9-f7e85b6a067b.png "Notes are footnotes by default with the special `@footnote` rule (Two layout showing the default setup for footnotes)")

This would have the exact same behavior when using the following declarations:

```css
@page {
  @note-area {
    content: element(footnotes, all-once);
    float: bottom;
    float-reference: page;
    width: 100%;
  }
}

note.footnote {
  position: note(footnote);
}
```

:::

## Notes in continuous media

Notes in continuous media can follow the same general model as notes in paged media. The section *Create notes with CSS* applies to both types of media.

However, in continuous media, an explicit mechanism is needed to define where notes should appear, since there is no implicit page structure to anchor note areas. This requires associating a parent element with the note container.

We outline three syntactic proposals currently under discussion. All aim to allow *endnotes*, *margin notes*, or *sidenotes* for any block-level element, without requiring additional HTML markup.



### Proposal 1: Use `element()` with `::after`

This approach uses the standard `::after` pseudo-element and the `element()` function to insert the content of the note. 


```css
note {
  position: note(sidenotes);
}

section::after {
  content: element(sidenotes);
}
```


**Considerations**

- Simple and uses existing CSS.
- `::after` is already widely used by authors and cannot be duplicated, which may conflict with other content or styles.
- The `::after` pseudo-element is inline by default and only supports textual `content` in most current implementations.
- Only one `::after` declaration is allowed, making it impossible to define multiple note areas.

  

### Proposal 2 : Introduce a new `::note-area` pseudo element

The `::note-area` pseudo-element represents a dedicated block-level container for notes generated via the `note()` / `element()` mechanism. It dynamically inserts note content at the end of the selected element.

`::note-area` creates a pseudo-element that is the last-child of the selected element or the penultimate if an `::after` pseudo-element is displayed. It only accepts `content: element(<ident>)` values and is block-level by default.

The `::note-area` only receives notes originating from its parent, it does not aggregate notes from elsewhere in the document.


```css
note {
  position: note(sidenotes);
}

section::note-area {
  content: element(sidenotes);
}
```

**Considerations**

- Pseudo-elements are not accessible in the DOM and may be harder to script or interact with.
- Pseudo-elements default to `inline`, though that can be overridden (`display: block` can be assumed here).
- Only one `::note-area` pseudo-element is possible per element; multiple note streams require more complex handling or alternative syntax.

### Proposal 3 : Use `@note-area` 

This approach introduces `@note-area` at-rule nested inside the CSS rule of the parent element. It provides explicit mapping between the element and the note stream.


```css
note {
  position: note(sidenotes);
}

section {
  @note-area {
  	content: element(sidenotes);
	}
}
```

**Considerations**

- Advantage: multiple `@note-area` block can be defined within a single element, supporting multiple note streams.
- Keeps the note container within the DOM context, unlike pseudo-elements.
- Is the at-rule model too divergent from traditional CSS syntax?
- May align well with future CSS features such as container queries or scoped styles.

  
### Further Examples and Use Cases

In all three proposals, once the note is mapped to its container, authors can use existing CSS layout mechanisms to position and size the note content, such as: float, absolute positioning, grid, exclusion, etc.

Note styling is defined in the note element and applies identically across all three models.

All three proposals also support inheritance: nested elements can override or inherit note behavior from their parents.

For example, marginal notes can be achieved in all three models using similar layout logic. Here’s an example using `::note-area`.



::: example numbered

```css
note {
  position: note(margin-notes);
}

section::note-area {
  content: element(margin-notes);
  float-reference: inline;
  float: left;
  clear: both;
  width: 180px;
  margin-left: -180px;
}
```

This creates margin notes aligned with the note reference, placed in the left of the parent section.

:::

::: issue

**ISSUE** A dedicated issue is open to track these discussions and ensure a clear path forward for note handling in continuous media: https://github.com/css-print-lab/css-print-lab.github.io/issues/10

:::



## Notes policy

In paged media, it can happen at the end of the page that the last note overflows from the note area. As a general rule, overflow content can be moved to the next page in the note area or the margin box that corresponds to the previous one. However, rendering notes can be complex. Like the [`footnote-policy`](https://www.w3.org/TR/css-gcpm-3/#footnote-policy) property in the css-gcpm-3, we need a `note-policy` that gives authors some control over the rendering. We propose to update the current specifications.

The `note-policy` must be declared in the global context of the note area or the margin box.

The values accepted in `note-policy` are `auto`, `line` or `block`.

### `note-policy: auto`

The user agent chooses how to render notes, and may place some of the note body on a later page than the note reference. A note body must never be placed on a page before the note reference.

If the entire note doesn’t fit in the note area or the margin box, due to the lack of space, the user agent displays the note line by line. If the addition of a new line implies the disappearance in the page of the line of text containing the note call, the user agent stops the rendering of the note and passes the content of the remaining note in the corresponding note area on the next page. Note that the user agent must honor [widows and orphans](http://dev.w3.org/csswg/css-break/#widows-orphans) settings when doing this, and may need to apply `line` value on certain notes to do so.

### `note-policy: line`

If a given note body cannot be placed on the current page due to lack of space, the user agent introduces a forced page break before the line containing the note reference, so that both the reference and the note body end up on the next page. Note that the user agent must honor [widows and orphans](http://dev.w3.org/csswg/css-break/#widows-orphans) settings when doing this, and may need to insert the page break on an earlier line.

### `note-policy: block`

As with line, except that the forced page break is introduced before the paragraph that contains the note.

---

::: tof

:::

