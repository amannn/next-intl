import type {LucideIcon} from 'lucide-react';
import {Languages, Calculator, Route, Wrench} from 'lucide-react';

export type NavItem = {
  title: string;
  slug: string;
  description?: string;
  status?: 'available' | 'coming-soon';
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const sections: NavSection[] = [
  {
    title: 'Translations',
    icon: Languages,
    items: [
      {
        title: 'Server components',
        slug: '/translations/server-components',
        description:
          'Read translated strings inside async Server Components — zero client JS.',
        status: 'available'
      },
      {
        title: 'Client components',
        slug: '/translations/client-components',
        description:
          'Use translations from Client Components for interactive content.',
        status: 'available'
      }
    ]
  },
  {
    title: 'Formatting',
    icon: Calculator,
    items: [
      {
        title: 'Dates',
        slug: '/formatting/dates',
        description:
          'Format dates and times for the active locale with useFormatter.',
        status: 'available'
      },
      {
        title: 'Numbers',
        slug: '/formatting/numbers',
        description:
          'Format numbers, currencies, and percentages — separators flip per locale.',
        status: 'available'
      },
      {
        title: 'Explorer',
        slug: '/formatting/explorer',
        description:
          'Drive useFormatter() with live options and compare output across locales.',
        status: 'available'
      }
    ]
  },
  {
    title: 'Routing',
    icon: Route,
    items: [
      {
        title: 'Mixed routing',
        slug: '/routing/mixed-routing',
        description:
          'Locale-prefixed vs unprefixed paths — see the three localePrefix modes side by side.',
        status: 'available'
      }
    ]
  },
  {
    title: 'Patterns',
    icon: Wrench,
    items: [
      {
        title: 'Locale switcher',
        slug: '/patterns/locale-switcher',
        description:
          'Replay the current path under a different locale while preserving params.',
        status: 'available'
      }
    ]
  }
];
