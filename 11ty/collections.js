export default async function (eleventyConfig) {
  //collection for search
  eleventyConfig.addCollection("pages", (collectionApi) => {
    let pages = collectionApi.getFilteredByGlob("src/content/pages/**/*.md");
    return pages;
  });
  eleventyConfig.addCollection("specs", (collectionApi) => {
    let specs = collectionApi.getFilteredByGlob("src/content/specs/**/*.md");
    return specs;
  });
}
