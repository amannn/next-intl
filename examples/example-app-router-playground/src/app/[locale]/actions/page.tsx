import {pick} from 'lodash';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import List from './List';
import ListItem from './ListItem';
import ListItemAsync from './ListItemAsync';
import ListItemClient from './ListItemClient';

export default function ServerActions() {
  return (
    <>
      <List
        getNextItem={async (curLength: number) => {
          'use server';
          const id = curLength + 1;
          return <ListItem id={id} />;
        }}
        title="Shared Server Components"
      />
      <List
        getNextItem={async (curLength: number) => {
          'use server';
          const id = curLength + 1;
          return <ListItemAsync id={id} />;
        }}
        title="Async Server Components"
      />
      <NextIntlClientProvider messages={pick(useMessages(), ['ServerActions'])}>
        <List
          getNextItem={async (curLength: number) => {
            'use server';
            const id = curLength + 1;
            return <ListItemClient id={id} />;
          }}
          title="Client Components"
        />
      </NextIntlClientProvider>
    </>
  );
}
