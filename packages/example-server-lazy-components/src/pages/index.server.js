
import * as React from 'react'
import Page from '../components/Page'
import ClientWidget from '../components/ClientWidget.client'
import { NextIntlProvider,useTranslations } from 'next-intl'



// // Shared Components
// import Skeletons from '../components/skeletons'

// // Server Components
// import SystemInfo from '../components/server-info.server'

// Client Components


// import Story from '../components/story.client'
// import Footer from '../components/footer.client'
// import ErrorPlaceholder from '../components/error-placeholder.client'

// // Utils
// import fetchData from '../lib/fetch-data'
// import { transform } from '../lib/get-item'
// import useData from '../lib/use-data'

// function StoryWithData({ id }) {
//   const { data } = useData(`s-${id}`, () => fetchData(`item/${id}`).then(transform))
//   return <Story {...data} />
// }

// function NewsWithData() {
//   const { data: storyIds, error } = useData('top', () => fetchData('topstories'))
//   return (
//     <>
//       {error ? <ErrorPlaceholder error={error} /> : null}
//       {storyIds ?
//         storyIds.slice(0, 30).map((id) => {
//           return <StoryWithData id={id} key={id} />
//         }) : 
//         null
//       }
//     </>
//   )
// }

console.log(React);

function Foo() {
  const t = useTranslations('Foo');

  return <p>{t('title')}</p>
}

export default function Index() {
  return (
    <NextIntlProvider locale='en' 
    messages={{
      Foo: {title:'Foo'},
      ClientWidget: {title:'ClientWidget'},
    }}
    >
      <Page>
        <Foo />
        <React.Suspense fallback="Loading …">
          <ClientWidget />
        </React.Suspense>
      </Page>
     </NextIntlProvider>
  )
}
