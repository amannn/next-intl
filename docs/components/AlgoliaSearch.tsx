import {DocSearch} from '@docsearch/react';
import '@docsearch/css';
import './AlgoliaSearch.css';

export default function AlgoliaSearch() {
  return (
    <DocSearch
      apiKey="7c038bab58b7eb07475d5dcdfdaba88f"
      appId="4MXOXYFOUD"
      indexName="next-intl-vercel"
    />
  );
}
