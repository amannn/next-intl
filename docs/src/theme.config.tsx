import {useRouter} from 'next/router';
import {
  DocsThemeConfig,
  Navbar,
  ThemeSwitch,
  useConfig
} from 'nextra-theme-docs';
import {ComponentProps} from 'react';
import AlgoliaSearch from '@/components/AlgoliaSearch';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import PartnerSidebar from '@/components/PartnerSidebar';
import Pre from '@/components/Pre';
import config from './config';

export const TITLE_TEMPLATE_SUFFIX = ' – ' + config.description;

export default {
  project: {
    link: config.githubUrl
  },
  docsRepositoryBase: config.githubUrl + '/blob/main/docs',
  color: {
    hue: {light: 210, dark: 195}
  },
  components: {
    pre: Pre
  },
  footer: {
    component: Footer
  },
  toc: {
    backToTop: null
  },
  navigation: true,
  darkMode: true,
  logo: Logo,
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1,
    toggleButton: false
  },
  themeSwitch: {
    component(props: ComponentProps<typeof ThemeSwitch>) {
      return (
        <div className="flex items-end justify-between">
          <PartnerSidebar />
          <ThemeSwitch {...props} />
        </div>
      );
    }
  },
  navbar: {
    component: function CustomNavbar({
      items,
      ...rest
    }: ComponentProps<typeof Navbar>) {
      const router = useRouter();
      const isRoot = router.pathname === '/';
      // https://github.com/shuding/nextra/issues/2836
      const props = {
        items: items.map((item) => {
          if (item.route === '/docs') {
            return {
              ...item,
              firstChildRoute: '/docs/getting-started'
            };
          } else {
            return item;
          }
        }),
        ...rest
      };

      if (!isRoot) return <Navbar {...props} />;

      return (
        <div className="navbar-home group">
          <Navbar {...props} />
        </div>
      );
    }
  },
  search: {
    component: AlgoliaSearch
  },
  feedback: {
    content: 'Provide feedback on this page',
    useLink: () => {
      const router = useRouter();
      const pageConfig = useConfig();

      const url = new URL(config.githubUrl);
      url.pathname += '/issues/new';
      url.searchParams.set('title', `[Docs]: ${pageConfig.title}`);
      url.searchParams.set('template', 'update_docs.yml');
      url.searchParams.set('pageLink', config.baseUrl + router.pathname);

      return url.href;
    }
  },
  head: function Head() {
    const pageConfig = useConfig();
    const {route} = useRouter();
    const isDefault = route === '/' || !pageConfig.title;

    const ogPayload = {
      title: isDefault ? config.description : pageConfig.title,
      subtitle: pageConfig.frontMatter.subtitle
    };
    const ogImageUrl = new URL('/api/og-image', config.baseUrl);
    ogImageUrl.search = new URLSearchParams({
      params: JSON.stringify(ogPayload)
    }).toString();

    const description =
      pageConfig.frontMatter.description ||
      'Internationalization (i18n) for Next.js';
    const title = pageConfig.title + TITLE_TEMPLATE_SUFFIX;

    return (
      <>
        <title>{title}</title>
        <meta content={title} name="og:title" />
        <meta content={title} name="twitter:title" />

        <meta content={description} name="description" />
        <meta content={description} name="og:description" />
        <meta content={description} name="twitter:description" />

        <meta content={ogImageUrl.toString()} name="og:image" />

        <link
          href="/favicon/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link href="/favicon/site.webmanifest" rel="manifest" />
        <link
          color="#5bbad5"
          href="/favicon/safari-pinned-tab.svg"
          rel="mask-icon"
        />
        <meta content="#da532c" name="msapplication-TileColor" />
        <meta content="#ffffff" name="theme-color" />

        <meta content="jamannnnnn" name="twitter:site" />
        <meta content="summary_large_image" name="twitter:card" />
      </>
    );
  }
} satisfies DocsThemeConfig;
