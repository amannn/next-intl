/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {DocSearch} from '@docsearch/react';
import Router from 'next/router';
import {TITLE_TEMPLATE_SUFFIX} from '@/theme.config';
import '@docsearch/css';
import './AlgoliaSearch.css';

export default function AlgoliaSearch() {
  return (
    <DocSearch
      apiKey="7c038bab58b7eb07475d5dcdfdaba88f"
      appId="4MXOXYFOUD"
      indexName="next-intl-vercel"
      navigator={{
        navigate({itemUrl}) {
          Router.push(itemUrl);
        }
      }}
      transformItems={(items) =>
        items.map((item) => {
          const url = new URL(item.url);
          const localUrl = item.url.replace(url.origin, '');

          return {
            ...item,
            url: localUrl,

            // Remove page title from the hierarchy
            _snippetResult: {
              ...item._snippetResult,
              hierarchy: {
                ...item._snippetResult.hierarchy,
                lvl1: {
                  ...item._snippetResult.hierarchy?.lvl1,
                  value: item._snippetResult.hierarchy?.lvl1?.value?.replace(
                    TITLE_TEMPLATE_SUFFIX,
                    ''
                  )
                }
              }
            }
          };
        })
      }
    />
  );
}
