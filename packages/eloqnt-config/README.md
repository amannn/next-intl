# @eloqnt/config

The shared contract for message format codecs, with no dependency on a specific consumer:

```ts
import {defineCodec} from '@eloqnt/config';

export default defineCodec(() => ({
  decode(content, context) {
    // ...
  },
  encode(messages, context) {
    // ...
  }
}));
```

See the [docs](https://cli.eloqnt.dev/docs/formats/configuration) for details.
