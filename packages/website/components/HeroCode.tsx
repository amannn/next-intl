/* eslint-disable react/no-unescaped-entities */
import clsx from 'clsx';
import {ReactNode, useState} from 'react';

function Tab({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick(): void;
}) {
  return (
    <button
      className={clsx(
        'flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-slate-800 text-sky-100/70 text-white'
          : 'bg-slate-800/40 text-slate-500 hover:bg-slate-800'
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

const files = [
  {
    name: 'UserDetails.tsx',
    code: (
      <code data-language="js" data-theme="default">
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>import</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            {'{'}useTranslations
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {' '}
            useFormatter{'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>from</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            'next-intl'
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>;</span>
        </span>
        <span className="line"> </span>
        <span className="line">
          <span style={{color: 'var(--shiki-token-keyword)'}}>function</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            UserDetails
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            ({'{'}user{'}'}) {'{'}
          </span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>t</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            useTranslations
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            'UserDetails'
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>);</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>format</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            useFormatter
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>();</span>
        </span>
        <span className="line"> </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
          <span style={{color: 'var(--shiki-color-text)'}}> (</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'    '}
            &lt;
          </span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            section
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}
            &lt;
          </span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            h2
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;{'{'}</span>
          <span style={{color: 'var(--shiki-token-function)'}}>t</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            'title'
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>){'}'}&lt;/</span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            h2
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}
            &lt;
          </span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            p
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;{'{'}</span>
          <span style={{color: 'var(--shiki-token-function)'}}>t</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            'followers'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}count</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>user</span>
          <span style={{color: 'var(--shiki-color-text)'}}>.</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>followers</span>
          <span style={{color: 'var(--shiki-color-text)'}}>.</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>length</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'}'}){'}'}&lt;/
          </span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            p
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}
            &lt;
          </span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            p
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;{'{'}</span>
          <span style={{color: 'var(--shiki-token-function)'}}>t</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            'lastSeen'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}time</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>format</span>
          <span style={{color: 'var(--shiki-token-function)'}}>
            .relativeTime
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>user</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            .lastSeen){'}'})
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&lt;/</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>p</span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'      '}
            &lt;
          </span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            Image
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>alt</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}>{'{'}</span>
          <span style={{color: 'var(--shiki-token-function)'}}>t</span>
          <span style={{color: 'var(--shiki-color-text)'}}>(</span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            'portrait'
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
          <span style={{color: 'var(--shiki-color-text)'}}> {'{'}username</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-constant)'}}>user</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            .name{'}'}){'} '}
          </span>
          <span style={{color: 'var(--shiki-token-function)'}}>src</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-color-text)'}}>{'{'}</span>
          <span style={{color: 'var(--shiki-token-constant)'}}>user</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            .portrait{'}'}{' '}
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>/&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-color-text)'}}>&lt;/</span>
          <span
            style={{
              color: 'var(--shiki-token-string-expression)'
            }}
          >
            section
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '});</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
      </code>
    )
  },
  {
    name: 'en.json',
    code: (
      <code data-language="js" data-theme="default">
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'{'}</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "UserDetails"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>: {'{'}</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "title"
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "User details"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "followers"
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "{'{'}count, plural,
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'                    '}
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            =0 {'{'}No followers yet{'}'}
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'                    '}
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            =1 {'{'}One follower{'}'}
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'                    '}
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            other {'{'}# followers{'}'}
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>
            {'                  '}
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            {'}'}"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "lastSeen"
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "Last seen {'{'}time{'}'}"
          </span>
          <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "portrait"
          </span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "Portrait of {'{'}username{'}'}"
          </span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  }'}</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'}'}</span>
        </span>
      </code>
    )
  },
  {
    name: 'Output',
    code: (
      <code data-language="html" data-theme="default">
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            section
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            h2
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            &gt;User details&lt;/
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            h2
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>p</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            &gt;1,481 followers&lt;/
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>p</span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>p</span>
          <span style={{color: 'var(--shiki-color-text)'}}>
            &gt;Last seen 2 hours ago&lt;/
          </span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>p</span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>{'  '}&lt;</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            img
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>alt</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "Portrait of Jane"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> </span>
          <span style={{color: 'var(--shiki-token-function)'}}>src</span>
          <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            "/media/jane.png"
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}> /&gt;</span>
        </span>
        <span className="line">
          <span style={{color: 'var(--shiki-color-text)'}}>&lt;/</span>
          <span style={{color: 'var(--shiki-token-string-expression)'}}>
            section
          </span>
          <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
        </span>
      </code>
    )
  }
];

export default function HeroCode() {
  const [fileIndex, setFileIndex] = useState(0);

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-sky-300 via-sky-300/70 to-blue-300 opacity-10 blur-lg" />
      <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-sky-300 via-sky-300/70 to-blue-300 opacity-10" />
      <div className="relative rounded-md bg-[#0A101F]/80 ring-1 ring-white/10 backdrop-blur">
        <div className="absolute -top-px right-10 h-px w-1/2 bg-gradient-to-r from-sky-300/0 via-sky-300/40 to-sky-300/0" />
        <div className="p-4">
          <svg
            aria-hidden="true"
            className="h-2.5 w-auto"
            fill="none"
            viewBox="0 0 42 10"
          >
            <circle className="fill-slate-800" cx={5} cy={5} r="4.5" />
            <circle className="fill-slate-800" cx={21} cy={5} r="4.5" />
            <circle className="fill-slate-800" cx={37} cy={5} r="4.5" />
          </svg>
          <div className="mt-4 flex space-x-2 overflow-x-auto">
            {files.map((file) => (
              <Tab
                key={file.name}
                active={fileIndex === files.indexOf(file)}
                onClick={() => setFileIndex(files.indexOf(file))}
              >
                {file.name}
              </Tab>
            ))}
          </div>
          <div className="mt-6 flex items-start lg:min-h-[300px] lg:w-[684px]">
            <pre className="ml-[-16px] flex overflow-x-auto px-0" data-theme>
              {files[fileIndex].code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
