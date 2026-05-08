import type { LucideIcon } from 'lucide-react';
import { Languages, Calculator, Route, Wrench } from 'lucide-react';

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
        status: 'available',
      },
      {
        title: 'Client components',
        slug: '/translations/client-components',
        description:
          'Use translations from Client Components for interactive content.',
        status: 'available',
      },
    ],
  },
  {
    title: 'Formatting',
    icon: Calculator,
    items: [],
  },
  {
    title: 'Routing',
    icon: Route,
    items: [],
  },
  {
    title: 'Patterns',
    icon: Wrench,
    items: [],
  },
];
