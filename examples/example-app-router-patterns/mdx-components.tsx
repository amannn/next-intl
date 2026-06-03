import type { MDXComponents } from 'mdx/types';
import { Code } from '@/components/code/code';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Code, ...components };
}
