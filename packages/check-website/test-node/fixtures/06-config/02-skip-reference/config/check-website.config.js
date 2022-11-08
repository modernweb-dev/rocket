/** @type {import('check-website').CheckWebsiteCliOptions} */
export default {
  skipCondition: url => url.startsWith('https://example.com/ignore-me'),
};
