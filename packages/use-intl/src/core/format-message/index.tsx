/**
 * This module provides the default formatMessage implementation.
 *
 * By default, it uses intl-messageformat to compile and format ICU messages
 * at runtime (compileAndFormat).
 *
 * When using next-intl with `precompile: true`, the build system will alias
 * this module to use the format-only implementation (formatOnly) which expects
 * messages to be precompiled at build time using icu-minify/compiler.
 *
 * This aliasing approach allows use-intl to work standalone with full
 * functionality, while next-intl users can opt into the precompilation
 * optimization for smaller bundles and faster formatting.
 */
export {default, type FormatMessageOptions} from './compile-format.js';
