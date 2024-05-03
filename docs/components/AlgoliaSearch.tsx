import {DocSearch} from '@docsearch/react';
import Router from 'next/router';
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
          return {...item, url: localUrl};
        })
      }
    />
  );
}
