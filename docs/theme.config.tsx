import AlgoliaSearch from 'components/AlgoliaSearch';
import Footer from 'components/Footer';
import Logo from 'components/Logo';
import PartnerSidebar from 'components/PartnerSidebar';
import {useRouter} from 'next/router';
import {ThemeConfig} from 'nextra';
import {Navbar, ThemeSwitch, useConfig} from 'nextra-theme-docs';
import {ComponentProps} from 'react';
import config from './config';

export const TITLE_TEMPLATE_SUFFIX =
  ' – Internationalization (i18n) for Next.js';

export default {
  project: {
    link: config.githubUrl
  },
  docsRepositoryBase: config.githubUrl + '/blob/main/docs',
  useNextSeoProps() {
    return {
      titleTemplate: '%s' + TITLE_TEMPLATE_SUFFIX
    };
  color: {
    hue: {light: 210, dark: 195}
  },
  footer: {
    component: Footer
  },
  navigation: true,
  darkMode: true,
  logo: Logo,
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1
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
        <div className="navbar-home">
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
  head: () => (
    <>
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

      <meta content="next-intl" name="og:title" />
      <meta content="next-intl" name="twitter:title" />

      <meta
        content="Internationalization (i18n) for Next.js"
        name="description"
      />
      <meta
        content="Internationalization (i18n) for Next.js"
        name="og:description"
      />
      <meta
        content="Internationalization (i18n) for Next.js"
        name="twitter:description"
      />

      <meta content="jamannnnnn" name="twitter:site" />
      <meta content="summary_large_image" name="twitter:card" />

      <meta
        content={config.baseUrl + '/twitter-image.png'}
        name="twitter:image"
      />
      <meta content={config.baseUrl + '/og-image.png'} name="og:image" />
    </>
  )
} satisfies ThemeConfig;
