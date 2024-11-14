import {GetICUArgs, GetICUArgsOptions} from '@schummar/icu-type-parser';

type ICUArgs<Message extends string, Options extends GetICUArgsOptions> =
  // This is important when `t` is returned from a function and there's no
  // known `Message` yet. Otherwise, we'd run into an infinite loop.
  string extends Message ? {} : GetICUArgs<Message, Options>;

export default ICUArgs;
