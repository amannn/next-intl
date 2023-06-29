import {Tabs} from 'nextra-theme-docs';
import {ReactNode} from 'react';
import Chip from './Chip';

type Props = {
  children: ReactNode;
  defaultLabel?: ReactNode;
  rscLabel?: ReactNode;
};

export default function VersionTabs({
  children,
  defaultLabel = 'Default',
  rscLabel = 'Server Components'
}: Props) {
  return (
    <Tabs
      items={[
        defaultLabel,
        <span key="2" className="inline-flex items-center">
          <span>{rscLabel}</span>
          <Chip className="ml-2" color="yellow">
            Beta
          </Chip>
        </span>
      ]}
    >
      {children}
    </Tabs>
  );
}
