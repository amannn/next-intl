/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */

function icu() {
  return (
    <code data-language="js" data-theme="default">
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'{'}</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>"UserProfile"</span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}>:</span>
        <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>"title"</span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}>:</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          "{'{'}firstName{'}'}'s profile"
        </span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>"followers"</span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}>:</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          "{'{'}count, plural,
        </span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          {'                    '}
          =0 {'{'}No followers yet{'}'}
        </span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          {'                    '}
          =1 {'{'}One follower{'}'}
        </span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          {'                    '}
          other {'{'}# followers{'}'}
        </span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}> ↵</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          {'                  '}
          {'}'}"
        </span>
      </span>
    </code>
  );
}

function datesTimesNumbers() {
  return (
    <code data-language="js" data-theme="default">
      <span className="line">
        <span style={{color: 'var(--shiki-token-comment)'}}>
          // "Feb 28, 2023"
        </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-constant)'}}>format</span>
        <span style={{color: 'var(--shiki-token-function)'}}>.dateTime</span>
        <span style={{color: 'var(--shiki-color-text)'}}>(lastSeen</span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          'medium'
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>);</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-comment)'}}>
          // "2 hours ago"
        </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-constant)'}}>format</span>
        <span style={{color: 'var(--shiki-token-function)'}}>
          .relativeTime
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>(lastSeen);</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-comment)'}}>
          // "$1,499.90"
        </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-constant)'}}>format</span>
        <span style={{color: 'var(--shiki-token-function)'}}>.number</span>
        <span style={{color: 'var(--shiki-color-text)'}}>(</span>
        <span style={{color: 'var(--shiki-token-constant)'}}>1499.9,</span>
        <span style={{color: 'var(--shiki-color-text)'}}>{' {'}</span>
        <span style={{color: 'var(--shiki-color-text)'}}>style: </span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          'currency'
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>, currency: </span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          'USD'
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>{'}'});</span>
      </span>
    </code>
  );
}

function typeSafe() {
  return (
    <code data-language="tsx" data-theme="default">
      <span className="line">
        <span style={{color: 'var(--shiki-token-keyword)'}}>function</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-function)'}}>UserProfile</span>
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
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          'UserProfile'
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>);</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>return</span>
        <span style={{color: 'var(--shiki-color-text)'}}> (</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'    '}&lt;</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          section
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'      '}&lt;</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>h1</span>
        <span style={{color: 'var(--shiki-color-text)'}}>&gt;{'{'}</span>
        <span style={{color: 'var(--shiki-token-function)'}}>t</span>
        <span style={{color: 'var(--shiki-color-text)'}}>(</span>
        <span
          className="relative"
          style={{color: 'var(--shiki-token-string-expression)'}}
        >
          {"''"}
          <div className="absolute left-2 top-0 h-full border-l-[1.5px] border-slate-400" />
          <div className="absolute left-2 top-[calc(100%+2px)] min-w-[8rem] rounded-sm border border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <div className="bg-sky-100 p-1 dark:bg-slate-600">title</div>
            <div className="p-1">followers</div>
          </div>
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>){'}'}&lt;/</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>h1</span>
        <span style={{color: 'var(--shiki-color-text)'}}>&gt;</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>{'    '}&lt;/</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
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
  );
}

function hooks() {
  return (
    <code data-language="js" data-theme="default">
      <span className="line">
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
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          'UserProfile'
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}>);</span>
      </span>
      <span className="line">
        <span> </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-function)'}}>t</span>
        <span style={{color: 'var(--shiki-color-text)'}}>(</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
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
        <span style={{color: 'var(--shiki-color-text)'}}>{'}'}); </span>
        <span style={{color: 'var(--shiki-token-comment)'}}>// string</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-constant)'}}>t</span>
        <span style={{color: 'var(--shiki-token-function)'}}>.rich</span>
        <span style={{color: 'var(--shiki-color-text)'}}>(</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          'bio'
        </span>
        <span style={{color: 'var(--shiki-token-punctuation)'}}>,</span>
        <span style={{color: 'var(--shiki-color-text)'}}> {'{'}</span>
        <span style={{color: 'var(--shiki-token-function)'}}>b</span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>:</span>
        <span style={{color: 'var(--shiki-color-text)'}}> (chunks) </span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>=&gt;</span>
        <span style={{color: 'var(--shiki-color-text)'}}> &lt;</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>b</span>
        <span style={{color: 'var(--shiki-color-text)'}}>
          &gt;{'{'}chunks{'}'}&lt;/
        </span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>b</span>
        <span style={{color: 'var(--shiki-color-text)'}}>&gt;{'}'}); </span>
        <span style={{color: 'var(--shiki-token-comment)'}}>// ReactNode</span>
      </span>
      <span className="line">
        <span> </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-constant)'}}>format</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-function)'}}>useFormatter</span>
        <span style={{color: 'var(--shiki-color-text)'}}>();</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-constant)'}}>timeZone</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-function)'}}>useTimeZone</span>
        <span style={{color: 'var(--shiki-color-text)'}}>();</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-constant)'}}>locale</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-function)'}}>useLocale</span>
        <span style={{color: 'var(--shiki-color-text)'}}>();</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-keyword)'}}>const</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-constant)'}}>now</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-keyword)'}}>=</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-token-function)'}}>useNow</span>
        <span style={{color: 'var(--shiki-color-text)'}}>();</span>
      </span>
    </code>
  );
}

function buildOutput() {
  return (
    <code data-language="sh" data-theme="default">
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>$ </span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          next build
        </span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-comment)'}}>
          Route{'            '}Size{'       '}First load JS
        </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>┌ ● /</span>
        <span style={{color: 'var(--shiki-color-text)'}}> </span>
        <span style={{color: 'var(--shiki-color-text)'}}>
          {'           '}1.4
        </span>
        <span style={{color: 'var(--shiki-color-text)'}}> kB</span>
        <span style={{color: 'var(--shiki-color-text)'}}>{'     '}</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          87.6 kB
        </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>├ ● /about</span>
        <span style={{color: 'var(--shiki-color-text)'}}>{'       '}</span>
        <span style={{color: 'var(--shiki-color-text)'}}>205</span>
        <span style={{color: 'var(--shiki-color-text)'}}> B</span>
        <span style={{color: 'var(--shiki-color-text)'}}>{'      '}</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          86.2 kB
        </span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>└ λ /[username]</span>
        <span style={{color: 'var(--shiki-color-text)'}}>{'  '}</span>
        <span style={{color: 'var(--shiki-color-text)'}}>3.24</span>
        <span style={{color: 'var(--shiki-color-text)'}}> kB</span>
        <span style={{color: 'var(--shiki-color-text)'}}>{'    '}</span>
        <span style={{color: 'var(--shiki-token-string-expression)'}}>
          89.3 kB
        </span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span style={{color: 'var(--shiki-token-comment)'}}>
          ● (SSG) automatically generated as static HTML + JSON
        </span>
      </span>
    </code>
  );
}

function routing() {
  return (
    <code data-language="js" data-theme="default">
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>/</span>
        <span style={{color: 'var(--shiki-token-constant)'}}>en</span>
        <span style={{color: 'var(--shiki-color-text)'}}>/blog</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>/</span>
        <span style={{color: 'var(--shiki-token-constant)'}}>es</span>
        <span style={{color: 'var(--shiki-color-text)'}}>/blog</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>/</span>
        <span style={{color: 'var(--shiki-token-constant)'}}>de</span>
        <span style={{color: 'var(--shiki-color-text)'}}>/blog</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>/</span>
        <span style={{color: 'var(--shiki-token-constant)'}}>en</span>
        <span style={{color: 'var(--shiki-color-text)'}}>/about-us</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>/</span>
        <span style={{color: 'var(--shiki-token-constant)'}}>es</span>
        <span style={{color: 'var(--shiki-color-text)'}}>/sobre-nosotros</span>
      </span>
      <span className="line">
        <span style={{color: 'var(--shiki-color-text)'}}>/</span>
        <span style={{color: 'var(--shiki-token-constant)'}}>de</span>
        <span style={{color: 'var(--shiki-color-text)'}}>/ueber-uns</span>
      </span>
    </code>
  );
}

export default {
  icu,
  datesTimesNumbers,
  typeSafe,
  hooks,
  buildOutput,
  routing
};
