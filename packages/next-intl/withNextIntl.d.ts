import {NextConfig} from 'next';

type NextConfigWithI18n = NextConfig & {i18nConfig?: string};

export default function withNextIntl(config: NextConfigWithI18n): NextConfig;
