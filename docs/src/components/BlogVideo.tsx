import {ComponentProps} from 'react';
import Video from './Video';

export default function BlogVideo(
  props: Omit<ComponentProps<typeof Video>, 'className'>
) {
  return <Video className="-mx-3 my-5 xl:-mx-6 xl:my-8" {...props} />;
}
