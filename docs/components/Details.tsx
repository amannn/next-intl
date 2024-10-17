import {useMDXComponents} from 'nextra/mdx';
import {ComponentProps, useEffect, useReducer} from 'react';
import useLocationHash from 'hooks/useLocationHash';

type Props = ComponentProps<'details'>;

export default function Details({children, id, ...rest}: Props) {
  const locationHash = useLocationHash();
  const hasLoadedHash = locationHash !== undefined;
  const isActive = id === locationHash;
  const [key, resetKey] = useReducer((x) => x + 1, 0);

  const OriginalDetails = useMDXComponents().details as (
    props: Props
  ) => JSX.Element;

  useEffect(() => {
    // Use cases:
    // 1. Open when the hash is clicked
    // 2. Anchor is clicked while open (no change)
    // 3. Details were open, another hash is clicked (no change to open)
    //
    // Therefore, we set a new key when the details
    // are activated by a hash change.

    if (isActive) {
      resetKey();
    }
  }, [isActive]);

  return (
    <div className="relative">
      {id && (
        <a
          aria-label="Permalink for this section"
          className="subheading-anchor absolute right-3 top-3 scroll-m-[5rem]"
          href={`#${id}`}
          id={id}
        >
          {/* Styled by nextra via CSS class */}
        </a>
      )}
      <OriginalDetails
        key={key}
        id={id}
        open={hasLoadedHash ? isActive : undefined}
        {...rest}
      >
        {children}
      </OriginalDetails>
    </div>
  );
}
