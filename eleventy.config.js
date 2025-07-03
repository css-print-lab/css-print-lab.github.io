import { HtmlBasePlugin } from "@11ty/eleventy";
import markdownConfig from "./11ty/markdown.js";
import collections from "./11ty/collections.js";
import filters from "./11ty/filters.js";
import staticfiles from "./11ty/static-files.js";

export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(markdownConfig);
  eleventyConfig.addPlugin(filters);
  eleventyConfig.addPlugin(collections);
  eleventyConfig.addPlugin(staticfiles);

  return {
    dir: {
      input: "src",
      output: "public",
      includes: "layouts",
      data: "data",
    },
  };
}
