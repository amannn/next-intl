import {MetadataRoute} from 'next';

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== 'production') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/'
      }
    };
  } else {
    return {
      rules: {
        userAgent: '*',
        allow: '/'
      }
    };
  }
}
