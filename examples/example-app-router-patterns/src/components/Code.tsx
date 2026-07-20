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

export async function Code({
  value,
  lang = 'tsx',
  label
}: {
  value: string;
  lang?: string;
  label?: string;
}) {
  const highlighted = await highlight(
    {value, lang, meta: ''},
    'github-from-css'
  );

  const pre = (
    <Pre
      code={highlighted}
      handlers={[mark]}
      className="m-0 overflow-x-auto !bg-transparent py-3 !text-[13px] !leading-6"
    />
  );

  if (label) {
    return (
      <PlaygroundBoundary label={label} size="compact">
        {pre}
      </PlaygroundBoundary>
    );
  }

  return (
    <div className="border border-gray-200 p-3 dark:border-gray-700">{pre}</div>
  );
}
