import fs from 'fs/promises';
import {EvaluateOptions, evaluate} from '@mdx-js/mdx';
import {notFound} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import * as runtime from 'react/jsx-runtime';
import AsyncComponent from '../../../components/AsyncComponent';
import Counter from '../../../components/client/02-MessagesOnClientCounter/Counter';

async function MDXContent({filename}: {filename: string}) {
  // Custom components that can be
  // referenced in the content
  const components = {AsyncComponent, Counter};

  const locale = await getLocale();
  try {
    const file = await fs.readFile(`./content/${locale}/${filename}`, 'utf-8');
    const {default: Content} = await evaluate(file, runtime as EvaluateOptions);
    return <Content components={components} />;
  } catch (error) {
    notFound();
  }
}

export default async function AboutPage() {
  return <MDXContent filename="about.mdx" />;
}
