import type {MDXComponents} from 'mdx/types';

const components: MDXComponents = {
  wrapper: ({children}) => <article className="post">{children}</article>
};

export function useMDXComponents(): MDXComponents {
  return components;
}
