import {useRouter} from 'next/router';
import {Tabs} from 'nextra-theme-docs';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  items: Array<string>;
};

enum TAB_PATHS {
  SERVER_COMPONENTS_BETA = 'server-components-beta'
}

enum TAB_INDEXES {
  DEFAULT = 0,
  SERVER_COMPONENTS = 1
}

const QUERY_PARAM_NAME = 'version';

export default function AppRouterTabs({children, items}: Props) {
  const router = useRouter();

  const selectedIndex =
    router.query[QUERY_PARAM_NAME] === TAB_PATHS.SERVER_COMPONENTS_BETA
      ? TAB_INDEXES.SERVER_COMPONENTS
      : TAB_INDEXES.DEFAULT;

  function onChange(index: number) {
    const nextQuery = {...router.query};
    if (index === TAB_INDEXES.SERVER_COMPONENTS) {
      nextQuery[QUERY_PARAM_NAME] = TAB_PATHS.SERVER_COMPONENTS_BETA;
    } else {
      delete nextQuery[QUERY_PARAM_NAME];
    }

    router.push({query: nextQuery});
  }

  return (
    <Tabs items={items} onChange={onChange} selectedIndex={selectedIndex}>
      {children}
    </Tabs>
  );
}
