export default {
  index: {
    title: 'Introduction',
    type: 'page',
    display: 'hidden',
    theme: {layout: 'raw'}
  },
  docs: {
    title: 'Docs',
    type: 'page'
  },
  learn: {
    title: 'Learn',
    type: 'page',
    theme: {
      sidebar: false,
      toc: false
    },
    href: 'https://learn.next-intl.dev'
  },
  cli: {
    title: 'CLI',
    type: 'page',
    titleChildren: (
      <span className="absolute -right-4 -top-3 rotate-6 rounded-sm bg-blue-500 px-1 py-[1px] text-[10px] font-semibold uppercase tracking-wider text-white group-[.navbar-home]:bg-blue-300 group-[.navbar-home]:text-blue-900 dark:bg-blue-300 dark:text-blue-900">
        Beta
      </span>
    ),
    theme: {
      sidebar: false,
      toc: false
    },
    href: 'https://studio.eloqnt.dev/docs'
  },
  examples: {
    title: 'Examples',
    type: 'page',
    theme: {
      sidebar: false,
      toc: false
    }
  },
  blog: {
    title: 'Blog',
    type: 'page',
    theme: {
      sidebar: false,
      toc: false
    }
  }
};
