// dts-cli still uses TypeScript 4 and isn't able to 
// compile the types for the middlware correctly.
import createMiddleware from './dist/src/middleware';

export = createMiddleware;
