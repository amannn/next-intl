import useLocationHash from 'hooks/useLocationHash';
import {useMDXComponents} from 'nextra-theme-docs';
import {ComponentProps} from 'react';

type Props = ComponentProps<'details'>;

export default function Details({children, id, ...rest}: Props) {
  const locationHash = useLocationHash();
  const hasLoadedHash = locationHash !== undefined;
  const isActive = id === locationHash;

  const OriginalDetails = useMDXComponents().details as (
    props: Props
  ) => JSX.Element;

  return (
    <div className="relative">
      {id && (
        <a
          aria-label="Permalink for this section"
          className="subheading-anchor absolute right-3 top-3"
          href={`#${id}`}
          id={id}
        >
          {/* Styled by nextra via CSS class */}
        </a>
      )}
      <OriginalDetails
        key={String(isActive)}
        id={id}
        open={hasLoadedHash ? isActive : undefined}
        {...rest}
      >
        {children}
      </OriginalDetails>
    </div>
  );
}
