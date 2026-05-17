/**
 * Re-exports the build-time extraction API so workspace packages can run
 * extraction without going through Metro (e.g. in a shared UI package
 * with its own messages catalog).
 *
 * Matches `next-intl/extractor`.
 */
export {defineCodec, unstable_extractMessages} from 'intl-extractor';
