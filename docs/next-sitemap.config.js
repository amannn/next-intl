const config = require('./src/config');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: config.baseUrl,
  generateRobotsTxt: true,
  exclude: ['*/_meta']
};
