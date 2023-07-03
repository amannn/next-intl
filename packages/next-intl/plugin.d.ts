import {NextConfig} from 'next';

function withNextIntl(i18nPath?: string): ((config: NextConfig) => unknown);

// Currently only available via CJS
export = withNextIntl
