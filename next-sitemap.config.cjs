require("tsx/cjs");

const { resolveSiteUrl } = require("./src/lib/site-url.ts");

const siteUrl = resolveSiteUrl(process.env);

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  trailingSlash: false,
  exclude: ["/hackathon", "/hackathon/*"],
  transform: async (config, path) => ({
    loc: path,
    changefreq: config.changefreq,
    priority: config.priority,
    lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
  }),
};
