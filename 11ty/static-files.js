// static copy files!

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "static/css": "/css" });
  eleventyConfig.addPassthroughCopy({ "static/fonts": "/fonts" });
  eleventyConfig.addPassthroughCopy({ "static/js": "/js" });
  eleventyConfig.addPassthroughCopy({ "static/images": "/images" });

  eleventyConfig.addPassthroughCopy({
    "src/content/**/*.[jpg, png, svg]": "images/",
  });
  eleventyConfig.addPassthroughCopy({ "static/outputs": "/outputs" });
  eleventyConfig.addPassthroughCopy({ "static/plugins": "/plugins" });
  eleventyConfig.addPassthroughCopy({ "static/templates": "/templates" });
}
