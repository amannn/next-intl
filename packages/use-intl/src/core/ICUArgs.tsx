import {GetICUArgs} from '@schummar/icu-type-parser';

type ICUArgs<
  Message extends string,
  ICUArgument,
  ICUNumberArgument,
  ICUDateArgument
> =
  // This is important when `t` is returned from a function and there's no
  // known `Message` yet. Otherwise, we'd run into an infinite loop.
  string extends Message
    ? {}
    : GetICUArgs<
        Message,
        {
          ICUArgument: ICUArgument;
          ICUNumberArgument: ICUNumberArgument;
          ICUDateArgument: ICUDateArgument;
        }
      >;

export default ICUArgs;
