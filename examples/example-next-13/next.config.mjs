import webpack from "webpack"

const ROUTE_DECLARATION_FILE = "../types/link.d.ts"
class TypedRoutePlugin {

  apply(compiler) {
      compiler.hooks.compilation.tap("TypedRoutePlugin", (compilation) => {
          compilation.hooks.processAssets.tapAsync(
              {name: "TypedRoutePlugin", stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER},
             async (assets, callback) => {
                  if (assets[ROUTE_DECLARATION_FILE]) {
                      const original = assets[ROUTE_DECLARATION_FILE].source();
                      const modified = original + `
declare module "next-intl/link" {
  import type { LinkProps as OriginalLinkProps } from "next/dist/client/link.js";
  import type { AnchorHTMLAttributes, DetailedHTMLProps } from "react";
  import type { UrlObject } from "url";

  type LinkRestProps = Omit<
      Omit<
          DetailedHTMLProps<
              AnchorHTMLAttributes<HTMLAnchorElement>,
              HTMLAnchorElement
          >,
          keyof OriginalLinkProps
      > &
      OriginalLinkProps,
      "href"
  >;

  export type LinkProps<RouteInferType> = LinkRestProps & {
    /**
     * The path or URL to navigate to. This is the only required prop. It can also be an object.
     * @see https://nextjs.org/docs/api-reference/next/link
     */
    href: __next_route_internal_types__.RouteImpl<RouteInferType> | UrlObject;
  };

  export default function <RouteType>(props: LinkProps<RouteType>): JSX.Element;
}`;
                      assets[ROUTE_DECLARATION_FILE] = {
                          source: () => modified,
                          size: () => modified.length,
                      };
                  }
                  callback();
              },
          );
      })
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  webpack: (config) => {
    config.plugins.push(new TypedRoutePlugin());

    return config;
  }
};
export default nextConfig
