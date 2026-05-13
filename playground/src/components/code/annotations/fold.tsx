import type {AnnotationHandler} from 'codehike/code';

export const fold: AnnotationHandler = {
  name: 'fold',
  Inline: () => <span className="text-muted-foreground italic">…</span>
};
