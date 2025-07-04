import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItHeaderSection from "markdown-it-header-sections";
import pluginTOC from "eleventy-plugin-nesting-toc";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItImplicitFigures from "markdown-it-implicit-figures";

//markdown custom for specs

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  const markdown = markdownIt({
    implicitFigures: true,
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(markdownItAnchor, {})
    .use(markdownItImplicitFigures)
    .use(markdownItHeaderSection, {
      figcaption: "title",
      lazyLoading: true,
      keepAlt: true,
    });

  eleventyConfig.addFilter("markdownify", function (rawString) {
    return markdown.render(rawString);
  });
  eleventyConfig.addFilter("markdownifyInline", function (rawString) {
    return markdown.render(rawString);
  });

  // plugin TOC
  eleventyConfig.setLibrary("md", markdown);

  eleventyConfig.addPlugin(pluginTOC, {
    tags: ["h2", "h3", "h4"], // which heading tags are selected headings must each have an ID attribute
    wrapper: "nav", // element to put around the root `ol`/`ul`
    wrapperClass: "toc", // class for the element around the root `ol`/`ul`
    ul: false, // if to use `ul` instead of `ol`
    flat: false,
  });

  eleventyConfig.addPlugin(syntaxHighlight);
}
