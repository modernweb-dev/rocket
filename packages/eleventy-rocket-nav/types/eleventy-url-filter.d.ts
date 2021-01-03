declare module '@11ty/eleventy/src/Filters/Url.js' {
  function urlFilter(url: string, pathPrefix?: string): string;
  export = urlFilter;
}
