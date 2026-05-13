import type {AnnotationHandler} from 'codehike/code';
import {InnerLine} from 'codehike/code';

export const lineNumbers: AnnotationHandler = {
  name: 'line-numbers',
  Line: (props) => {
    const {lineNumber, totalLines} = props;
    const width = String(totalLines).length;
    return (
      <div className="flex">
        <span
          className="text-right pr-3 select-none text-muted-foreground tabular-nums"
          style={{width: `${width + 1}ch`}}
        >
          {lineNumber}
        </span>
        <InnerLine merge={props} className="flex-1" />
      </div>
    );
  }
};
