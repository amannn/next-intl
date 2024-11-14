import {GetICUArgs} from '@schummar/icu-type-parser';

type ICUArgs<
  Message extends string,
  ICUArgument,
  ICUNumberArgument,
  ICUDateArgument
> = GetICUArgs<
  Message,
  {
    ICUArgument: ICUArgument;
    ICUNumberArgument: ICUNumberArgument;
    ICUDateArgument: ICUDateArgument;
  }
>;

export default ICUArgs;
