/* eslint-disable react/no-unescaped-entities */
import clsx from 'clsx';
import {ReactNode, useState} from 'react';
import CodeSnippet from './CodeSnippet';

function CodeTab({
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
          ? 'bg-slate-800 text-white'
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
    name: 'UserProfile.tsx',
    code: (
      <CodeSnippet>
        <span className="line">
          <span data-token="keyword">import</span>
          <span data-token="text">
            {' '}
            {'{'}useTranslations{'}'}{' '}
          </span>
          <span data-token="keyword">from</span>
          <span data-token="text"> </span>
          <span data-token="string">'next-intl'</span>
          <span data-token="text">;</span>
        </span>
        <span className="line"> </span>
        <span className="line">
          <span data-token="keyword">export default function</span>
          <span data-token="text"> </span>
          <span data-token="function">UserProfile</span>
          <span data-token="text">
            ({'{'}user{'}'}) {'{'}
          </span>
        </span>
        <span className="line">
          <span data-token="text">{'  '}</span>
          <span data-token="keyword">const</span>
          <span data-token="text"> </span>
          <span data-token="constant">t</span>
          <span data-token="text"> </span>
          <span data-token="keyword">=</span>
          <span data-token="text"> </span>
          <span data-token="function">useTranslations</span>
          <span data-token="text">(</span>
          <span data-token="string">'UserProfile'</span>
          <span data-token="text">);</span>
        </span>
        <span className="line"> </span>
        <span className="line">
          <span data-token="text">{'  '}</span>
          <span data-token="keyword">return</span>
          <span data-token="text"> (</span>
        </span>
        <span className="line">
          <span data-token="text">{'    '}&lt;</span>
          <span data-token="string">section</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'      '}&lt;</span>
          <span data-token="string">h1</span>
          <span data-token="text">&gt;{'{'}</span>
          <span data-token="function">t</span>
          <span data-token="text">(</span>
          <span data-token="string">'title'</span>
          <span data-token="text">,</span>
          <span data-token="text"> {'{'}firstName</span>
          <span data-token="keyword">:</span>
          <span data-token="text"> </span>
          <span data-token="constant">user</span>
          <span data-token="text">
            .firstName{'}'}){'}'}&lt;/
          </span>
          <span data-token="string">h1</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'      '}&lt;</span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;{'{'}</span>
          <span data-token="function">t</span>
          <span data-token="text">(</span>
          <span data-token="string">'membership'</span>
          <span data-token="text">,</span>
          <span data-token="text"> {'{'}memberSince</span>
          <span data-token="keyword">:</span>
          <span data-token="text"> </span>
          <span data-token="constant">user</span>
          <span data-token="text">
            .memberSince{'}'}){'}'}&lt;/
          </span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'      '}&lt;</span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;{'{'}</span>
          <span data-token="function">t</span>
          <span data-token="text">(</span>
          <span data-token="string">'followers'</span>
          <span data-token="text">,</span>
          <span data-token="text"> {'{'}count</span>
          <span data-token="keyword">:</span>
          <span data-token="text"> </span>
          <span data-token="constant">user</span>
          <span data-token="text">
            .numFollowers{'}'}){'}'}&lt;/
          </span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'    '}&lt;/</span>
          <span data-token="string">section</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'  '});</span>
        </span>
        <span className="line">
          <span data-token="text">{'}'}</span>
        </span>
      </CodeSnippet>
    )
  },
  {
    name: 'en.json',
    code: (
      <CodeSnippet>
        <span className="line">
          <span data-token="text">{'{'}</span>
        </span>
        <span className="line">
          <span data-token="text">{'  '}</span>
          <span data-token="keyword">"UserProfile"</span>
          <span data-token="text">:</span>
          <span data-token="text"> {'{'}</span>
        </span>
        <span className="line">
          <span data-token="text">{'    '}</span>
          <span data-token="keyword">"title"</span>
          <span data-token="text">:</span>
          <span data-token="text"> </span>
          <span data-token="string">
            "{'{'}firstname{'}'}'s profile"
          </span>
          <span data-token="text">,</span>
        </span>
        <span className="line">
          <span data-token="text">{'    '}</span>
          <span data-token="keyword">"membership"</span>
          <span data-token="text">:</span>
          <span data-token="text"> </span>
          <span data-token="string">
            "Member since {'{'}memberSince, date, short{'}'}"
          </span>
          <span data-token="text">,</span>
        </span>
        <span className="line">
          <span data-token="text">{'    '}</span>
          <span data-token="keyword">"followers"</span>
          <span data-token="text">:</span>
          <span data-token="text"> </span>
          <span data-token="string">"{'{'}count, plural,</span>
          <span data-token="text"> ↵</span>
        </span>
        <span className="line">
          <span data-token="string">
            {'                    '}
            =0 {'{'}No followers yet{'}'}
          </span>
          <span data-token="text"> ↵</span>
        </span>
        <span className="line">
          <span data-token="string">
            {'                    '}
            =1 {'{'}One follower{'}'}
          </span>
          <span data-token="text"> ↵</span>
        </span>
        <span className="line">
          <span data-token="string">
            {'                    '}
            other {'{'}# followers{'}'}
          </span>
          <span data-token="text"> ↵</span>
        </span>
        <span className="line">
          <span data-token="string">
            {'                  '}
            {'}'}"
          </span>
        </span>
        <span className="line">
          <span data-token="text">{'  }'}</span>
        </span>
        <span className="line">
          <span data-token="text">{'}'}</span>
        </span>
      </CodeSnippet>
    )
  },
  {
    name: 'Output',
    code: (
      <CodeSnippet>
        <span className="line">
          <span data-token="text">&lt;</span>
          <span data-token="string">section</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'  '}&lt;</span>
          <span data-token="string">h2</span>
          <span data-token="text">&gt;Jane's profile&lt;/</span>
          <span data-token="string">h2</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'  '}&lt;</span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;Member since Oct 13, 2023&lt;/</span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">{'  '}&lt;</span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;1,481 followers&lt;/</span>
          <span data-token="string">p</span>
          <span data-token="text">&gt;</span>
        </span>
        <span className="line">
          <span data-token="text">&lt;/</span>
          <span data-token="string">section</span>
          <span data-token="text">&gt;</span>
        </span>
      </CodeSnippet>
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
              <CodeTab
                key={file.name}
                active={fileIndex === files.indexOf(file)}
                onClick={() => setFileIndex(files.indexOf(file))}
              >
                {file.name}
              </CodeTab>
            ))}
          </div>
          <div className="mt-6 flex items-start lg:min-h-[275px] lg:w-[684px]">
            <pre className="ml-[-16px] flex overflow-x-auto px-0">
              {files[fileIndex].code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
