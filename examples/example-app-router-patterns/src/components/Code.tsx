import clsx from 'clsx';
import {type AnnotationHandler, InnerLine, Pre, highlight} from 'codehike/code';
import PlaygroundBoundary from './PlaygroundBoundary';
import './Code.css';

const mark: AnnotationHandler = {
  name: 'mark',
  Line: ({annotation, ...props}) => (
    <div
      className={clsx(
        'flex border-l-2',
        annotation
          ? 'border-gray-400 bg-gray-100 dark:border-gray-500 dark:bg-gray-800'
          : 'border-transparent'
      )}
    >
      <InnerLine merge={props} className="flex-1 px-5" />
    </div>
  )
};

export default async function Code({
  value,
  label
}: {
  value: string;
  label: string;
}) {
  const highlighted = await highlight(
    {value, lang: 'tsx', meta: ''},
    'github-from-css'
  );

  return (
    <PlaygroundBoundary label={label} size="compact">
      <Pre
        code={highlighted}
        handlers={[mark]}
        className="-mx-3 my-0 overflow-x-auto !bg-transparent py-3 !text-[13px] !leading-6"
      />
    </PlaygroundBoundary>
  );
}
