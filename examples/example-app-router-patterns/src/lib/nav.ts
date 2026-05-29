import {Languages, type LucideIcon} from 'lucide-react';

export type NavItem = {
  // Keys into the `Nav` namespace so labels can be translated
  titleKey: string;
  descriptionKey: string;
  slug: string;
};

export type NavSection = {
  titleKey: string;
  icon: LucideIcon;
  items: Array<NavItem>;
};

export const sections: Array<NavSection> = [
  {
    titleKey: 'translations',
    icon: Languages,
    items: [
      {
        titleKey: 'serverComponents',
        descriptionKey: 'serverComponentsDescription',
        slug: '/translations/server-components'
      },
      {
        titleKey: 'clientComponents',
        descriptionKey: 'clientComponentsDescription',
        slug: '/translations/client-components'
      }
    ]
  }
];
