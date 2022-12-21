import {createIntlMiddleware} from 'next-intl/server';

export default createIntlMiddleware();

// TODO: As soon as Next.js allows to write cookies via
// `cookies().set(name, value)`, we can add this.
// https://beta.nextjs.org/docs/api-reference/cookies
//
// export const config = {
//   matcher: '/'
// };
