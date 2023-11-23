const config = require('./config');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: config.baseUrl,
  generateRobotsTxt: true
};
