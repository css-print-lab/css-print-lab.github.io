import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginTOC from "eleventy-plugin-nesting-toc";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItImplicitFigures from "markdown-it-implicit-figures";
import markdownItContainer from "markdown-it-container";

//markdown custom for specs

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
  })
    .use(markdownItImplicitFigures, {
      figcaption: "title",
    })
    .use(markdownItAnchor, {})
    .use(markdownItContainer, "example", {
      validate: function (params) {
        return /^example(\s+.*)?$/.test(params.trim());
      },
      render: function (tokens, idx) {
        const info = tokens[idx].info.trim();
        const m = info.match(/^example\s+(.*)$/);
        const classes = m ? md.utils.escapeHtml(m[1]) : "";
        // console.log(classes);

        if (tokens[idx].nesting === 1) {
          // opening tag
          return `<aside class="example ${classes}">`;
        } else {
          return "</aside>\n";
        }
      },
    })
    .use(markdownItContainer, "tof", {
      validate: function (params) {
        return /^tof(\s+.*)?$/.test(params.trim());
      },
      render: function (tokens, idx) {
        const info = tokens[idx].info.trim();
        const m = info.match(/^tof\s+(.*)$/);
        const title = m ? md.utils.escapeHtml(m[1]) : "";

        if (tokens[idx].nesting === 1) {
          // opening tag
          return `<section id="tof">`;
        } else {
          return "</section>\n";
        }
      },
    })
    .use(markdownItContainer, "advisement", {
      validate: function (params) {
        return /^issue(\s+.*)?$/.test(params.trim());
      },

      render: function (tokens, idx) {
        const info = tokens[idx].info.trim();
        const m = info.match(/^issue\s+(.*)$/);
        const title = m ? md.utils.escapeHtml(m[1]) : "";

        if (tokens[idx].nesting === 1) {
          // opening tag
          return `<div class="advisement ${title}">\n`;
        } else {
          return "</div>\n";
        }
      },
    })

    .use(markdownItContainer, "abstract", {
      validate: function (params) {
        return /^abstract(\s+.*)?$/.test(params.trim());
      },

      render: function (tokens, idx) {
        const info = tokens[idx].info.trim();
        const m = info.match(/^abstract\s+(.*)$/);
        const title = m ? md.utils.escapeHtml(m[1]) : "";

        if (tokens[idx].nesting === 1) {
          // opening tag
          return `<section id="abstract">${title ? `<h2>${title}</h2>\n` : ""}`;
        } else {
          // closing tag
          return "</section>\n";
        }
      },
    });

  eleventyConfig.addFilter("markdownify", function (rawString) {
    return md.render(rawString);
  });
  eleventyConfig.addFilter("markdownifyInline", function (rawString) {
    return md.render(rawString);
  });

  eleventyConfig.setLibrary("md", md);

  // plugin TOC
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ["h2", "h3", "h4"], // which heading tags are selected headings must each have an ID attribute
    wrapper: "nav", // element to put around the root `ol`/`ul`
    wrapperClass: "toc", // class for the element around the root `ol`/`ul`
    ul: false, // if to use `ul` instead of `ol`
    flat: false,
  });

  eleventyConfig.addPlugin(syntaxHighlight);
}
