import type {LucideIcon} from 'lucide-react';

export type NavItem = {
  slug: string;
  title: string;
  description?: string;
};

export type NavSection = {
  title: string;
  icon: LucideIcon;
  items: Array<NavItem>;
};
