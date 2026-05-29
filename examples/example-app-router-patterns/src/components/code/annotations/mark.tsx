import type {AnnotationHandler} from 'codehike/code';
import {InnerLine} from 'codehike/code';

export const mark: AnnotationHandler = {
  name: 'mark',
  Line: ({annotation, ...props}) => {
    const color = annotation?.query || 'rgb(14 165 233)';
    return (
      <div
        className="flex"
        style={{
          borderLeft: 'solid 2px transparent',
          borderLeftColor: annotation && color,
          backgroundColor: annotation && `rgb(from ${color} r g b / 0.1)`
        }}
      >
        <InnerLine merge={props} className="flex-1 px-2" />
      </div>
    );
  },
  Inline: ({annotation, children}) => {
    const color = annotation?.query || 'rgb(14 165 233)';
    return (
      <span
        className="-mx-0.5 rounded px-0.5 py-0"
        style={{
          outline: `solid 1px rgb(from ${color} r g b / 0.5)`,
          background: `rgb(from ${color} r g b / 0.13)`
        }}
      >
        {children}
      </span>
    );
  }
};
