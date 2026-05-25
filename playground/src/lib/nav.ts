import type {LucideIcon} from 'lucide-react';
import {Languages, Calculator, Route, Wrench} from 'lucide-react';

export type NavItem = {
  titleKey: string;
  slug: string;
  descriptionKey?: string;
  comingSoon?: boolean;
};

export type NavSection = {
  titleKey: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const sections: NavSection[] = [
  {
    titleKey: 'translations',
    icon: Languages,
    items: [
      {
        titleKey: 'serverComponents',
        slug: '/translations/server-components',
        descriptionKey: 'serverComponentsDesc'
      },
      {
        titleKey: 'clientComponents',
        slug: '/translations/client-components',
        descriptionKey: 'clientComponentsDesc'
      }
    ]
  },
  {
    titleKey: 'formatting',
    icon: Calculator,
    items: [
      {
        titleKey: 'dates',
        slug: '/formatting/dates',
        descriptionKey: 'datesDesc'
      },
      {
        titleKey: 'numbers',
        slug: '/formatting/numbers',
        descriptionKey: 'numbersDesc'
      },
      {
        titleKey: 'explorer',
        slug: '/formatting/explorer',
        descriptionKey: 'explorerDesc'
      }
    ]
  },
  {
    titleKey: 'routing',
    icon: Route,
    items: [
      {
        titleKey: 'mixedRouting',
        slug: '/routing/mixed-routing',
        descriptionKey: 'mixedRoutingDesc'
      }
    ]
  },
  {
    titleKey: 'patterns',
    icon: Wrench,
    items: [
      {
        titleKey: 'localeSwitcher',
        slug: '/patterns/locale-switcher',
        descriptionKey: 'localeSwitcherDesc'
      },
      {
        titleKey: 'browserLanguage',
        slug: '/patterns/browser-language',
        descriptionKey: 'browserLanguageDesc'
      },
      {
        titleKey: 'cacheComponents',
        slug: '/patterns/cache-components',
        descriptionKey: 'cacheComponentsDesc',
        comingSoon: true
      }
    ]
  }
];
