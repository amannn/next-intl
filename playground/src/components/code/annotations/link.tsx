import type {AnnotationHandler} from 'codehike/code';

export const link: AnnotationHandler = {
  name: 'link',
  Inline: ({annotation, children}) => (
    <a
      href={annotation.query}
      className="underline decoration-dotted underline-offset-4 hover:text-primary"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
};
