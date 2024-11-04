import {TranslateArgs} from './schummar.tsx';

// TODO: Pass options
export type ICUArgs<Value extends string> = TranslateArgs<Value, never>[0];
export default ICUArgs;
