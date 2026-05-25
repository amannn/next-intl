import type {AnnotationHandler, InlineAnnotation} from 'codehike/code';

export const callout: AnnotationHandler = {
  name: 'callout',
  transform: (annotation: InlineAnnotation) => {
    const {name, query, lineNumber, fromColumn, toColumn, data} = annotation;
    return {
      name,
      query,
      fromLineNumber: lineNumber,
      toLineNumber: lineNumber,
      data: {...data, column: (fromColumn + toColumn) / 2}
    };
  },
  Block: ({annotation, children}) => {
    const {column} = annotation.data as {column: number};
    return (
      <>
        {children}
        <div
          style={{minWidth: `${column + 4}ch`}}
          className="w-fit border bg-card border-current rounded px-2 relative -ml-[1ch] mt-1 whitespace-break-spaces"
        >
          <div
            style={{left: `${column}ch`}}
            className="absolute border-l border-t border-current w-2 h-2 rotate-45 -translate-y-1/2 -top-[1px] bg-card"
          />
          {annotation.query}
        </div>
      </>
    );
  }
};
