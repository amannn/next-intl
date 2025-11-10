import {readFileSync, writeFileSync} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Site configuration
const SITE_URL = 'https://next-intl.dev';
const FEED_URL = `${SITE_URL}/feed.xml`;
const TITLE = 'next-intl Blog';
const DESCRIPTION = 'Updates, guides, and insights about internationalization (i18n) in Next.js with next-intl';
const LANGUAGE = 'en';
const IMAGE_URL = `${SITE_URL}/og-image.png`;

function parseBlogPostLinks(mdx) {
  const results = [];

  // 1) Grab each <BlogPostLink ... />
  const componentRE = /<BlogPostLink\b([\s\S]*?)\/>/g;

  // 2) Pull key="value" pairs from the props string
  //    Supports "..." or '...' quotes, tolerates whitespace/newlines.
  const attrRE = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

  let compMatch;
  while ((compMatch = componentRE.exec(mdx))) {
    const propsStr = compMatch[1];
    const props = {};

    let attrMatch;
    while ((attrMatch = attrRE.exec(propsStr))) {
      const key = attrMatch[1];
      const value = (attrMatch[2] ?? attrMatch[3] ?? "").trim();
      props[key] = value;
    }

    // Only push if it looks like a blog link
    if (props.href && props.title && props.date && props.author) {
      results.push({
        href: props.href,
        title: props.title,
        date: props.date,
        author: props.author,
      });
    }
  }

  return results;
}

/**
 * Dynamically discover and parse blog posts from MDX files
 */
function getBlogPosts() {
  const blogIndexPath = join(
    __dirname,
    '..',
    'src',
    'pages',
    'blog',
    'index.mdx'
  );
  const mdx = readFileSync(blogIndexPath, 'utf8');
  const posts = parseBlogPostLinks(mdx);

  // Sort newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return posts;
}

function xmlEscape(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rfc822Date(d) {
  // RSS 2.0 uses RFC-822/RFC-1123 format; toUTCString() is acceptable.
  return new Date(d).toUTCString();
}

/**
 * blogPosts: Array<{ title, date, author?, description?, href? , slug? }>
 *  - date: Date | string
 *  - link is resolved from href (preferred) or `/blog/${slug}`
 */
export function generateRSS(blogPosts) {
  const itemsXml = blogPosts.map((post) => {
    const path = post.href ?? (post.slug ? `/blog/${post.slug}` : '');
    const link = path.startsWith('http') ? path : `${SITE_URL}${path}`;
    const pubDate = rfc822Date(post.date);
    const title = xmlEscape(post.title ?? '');
    const desc = post.description
      ? `\n      <description><![CDATA[${post.description}]]></description>`
      : '';
    const author = post.author ? `\n      <dc:creator>${xmlEscape(post.author)}</dc:creator>` : '';

    return `
    <item>
      <title>${title}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${pubDate}</pubDate>${author}${desc}
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${xmlEscape(DESCRIPTION)}</description>
    <language>${LANGUAGE}</language>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${IMAGE_URL}</url>
      <title>${xmlEscape(TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
    <lastBuildDate>${rfc822Date(new Date())}</lastBuildDate>
    ${itemsXml ? '\n' + itemsXml : ''}
  </channel>
</rss>\n`;

  const outputPath = join(__dirname, '..', 'public', 'feed.xml');
  writeFileSync(outputPath, xml, 'utf8');
  return { outputPath, xml };
}

const blogPosts = getBlogPosts();
generateRSS(blogPosts);