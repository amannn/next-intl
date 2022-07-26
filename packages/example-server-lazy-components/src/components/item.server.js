import React, { Suspense } from 'react'

import Page from './page.client'
import Item from './item.client'
import getItem from '../lib/get-item'
import useData from '../lib/use-data'
import Skeletons from './skeletons'

function ItemPageWithData({ id }) {  
  const { data: story } = useData(`item/${id}`, () => getItem(id))
  if (!story) return <Skeletons count={3} />
  return (
    <Item story={story} />
  )
}

export default function ItemPage({ id }) {
  if (!id) return null

  return (
    <Page>
      <Suspense fallback={<Skeletons count={10} />}>
        <ItemPageWithData id={id} />
      </Suspense>
    </Page>
  )
}
