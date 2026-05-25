import type {ReactNode} from 'react';
import {PlaygroundSidebar} from './sidebar';
import {PlaygroundByline} from './byline';

export function PlaygroundShell({children}: {children: ReactNode}) {
  return (
    <>
      <PlaygroundSidebar />
      <div className="lg:pl-72">
        <div className="mx-auto mt-16 mb-24 max-w-4xl px-4 sm:px-6 lg:px-8 lg:mt-0 lg:py-10">
          {children}
          <PlaygroundByline />
        </div>
      </div>
    </>
  );
}
