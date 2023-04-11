/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://' + (process.env.VERCEL_URL || 'next-intl-docs.vercel.app'),
  generateRobotsTxt: true
};
