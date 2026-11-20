import {type AnnotationHandler, InnerLine, Pre, highlight} from 'codehike/code';
import {PlaygroundBoundary} from './PlaygroundBoundary';

const mark: AnnotationHandler = {
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
  }
};

export async function Code({value, label}: {value: string; label: string}) {
  const highlighted = await highlight(
    {value, lang: 'tsx', meta: ''},
    'github-from-css'
  );

  return (
    <PlaygroundBoundary label={label} size="compact">
      <Pre
        code={highlighted}
        handlers={[mark]}
        className="m-0 overflow-x-auto !bg-transparent py-3 !text-[13px] !leading-6"
      />
    </PlaygroundBoundary>
  );
}
