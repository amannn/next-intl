/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */

import CodeSnippet from './CodeSnippet';

function icu() {
  return (
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
          "{'{'}firstName{'}'}'s profile"
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
    </CodeSnippet>
  );
}

function datesTimesNumbers() {
  return (
    <CodeSnippet>
      <span className="line">
        <span data-token="comment">// "Feb 28, 2023"</span>
      </span>
      <span className="line">
        <span data-token="constant">format</span>
        <span data-token="function">.dateTime</span>
        <span data-token="text">(lastSeen</span>
        <span data-token="text">,</span>
        <span data-token="text"> </span>
        <span data-token="string">'medium'</span>
        <span data-token="text">);</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span data-token="comment">// "2 hours ago"</span>
      </span>
      <span className="line">
        <span data-token="constant">format</span>
        <span data-token="function">.relativeTime</span>
        <span data-token="text">(lastSeen);</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span data-token="comment">// "$1,499.90"</span>
      </span>
      <span className="line">
        <span data-token="constant">format</span>
        <span data-token="function">.number</span>
        <span data-token="text">(</span>
        <span data-token="constant">1499.9,</span>
        <span data-token="text">{' {'}</span>
        <span data-token="text">style: </span>
        <span data-token="string">'currency'</span>
        <span data-token="text">, currency: </span>
        <span data-token="string">'USD'</span>
        <span data-token="text">{'}'});</span>
      </span>
    </CodeSnippet>
  );
}

function typeSafe() {
  return (
    <CodeSnippet>
      <span className="line">
        <span data-token="keyword">function</span>
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
        <span className="relative" data-token="string">
          {"''"}
          <div className="absolute left-2 top-0 h-full border-l-[1.5px] border-slate-400" />
          <div className="absolute left-2 top-[calc(100%+2px)] min-w-[8rem] rounded-sm border border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <div className="bg-sky-100 p-1 dark:bg-slate-600">title</div>
            <div className="p-1">followers</div>
          </div>
        </span>
        <span data-token="text">){'}'}&lt;/</span>
        <span data-token="string">h1</span>
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
  );
}

function hooks() {
  return (
    <CodeSnippet>
      <span className="line">
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
      <span className="line">
        <span> </span>
      </span>
      <span className="line">
        <span data-token="function">t</span>
        <span data-token="text">(</span>
        <span data-token="string">'followers'</span>
        <span data-token="text">,</span>
        <span data-token="text"> {'{'}count</span>
        <span data-token="keyword">:</span>
        <span data-token="text"> </span>
        <span data-token="constant">user</span>
        <span data-token="text">.</span>
        <span data-token="constant">followers</span>
        <span data-token="text">.</span>
        <span data-token="constant">length</span>
        <span data-token="text">{'}'}); </span>
        <span data-token="comment">// string</span>
      </span>
      <span className="line">
        <span data-token="constant">t</span>
        <span data-token="function">.rich</span>
        <span data-token="text">(</span>
        <span data-token="string">'bio'</span>
        <span data-token="text">,</span>
        <span data-token="text"> {'{'}</span>
        <span data-token="function">b</span>
        <span data-token="keyword">:</span>
        <span data-token="text"> (chunks) </span>
        <span data-token="keyword">=&gt;</span>
        <span data-token="text"> &lt;</span>
        <span data-token="string">b</span>
        <span data-token="text">
          &gt;{'{'}chunks{'}'}&lt;/
        </span>
        <span data-token="string">b</span>
        <span data-token="text">&gt;{'}'}); </span>
        <span data-token="comment">// ReactNode</span>
      </span>
      <span className="line">
        <span> </span>
      </span>
      <span className="line">
        <span data-token="keyword">const</span>
        <span data-token="text"> </span>
        <span data-token="constant">format</span>
        <span data-token="text"> </span>
        <span data-token="keyword">=</span>
        <span data-token="text"> </span>
        <span data-token="function">useFormatter</span>
        <span data-token="text">();</span>
      </span>
      <span className="line">
        <span data-token="keyword">const</span>
        <span data-token="text"> </span>
        <span data-token="constant">timeZone</span>
        <span data-token="text"> </span>
        <span data-token="keyword">=</span>
        <span data-token="text"> </span>
        <span data-token="function">useTimeZone</span>
        <span data-token="text">();</span>
      </span>
      <span className="line">
        <span data-token="keyword">const</span>
        <span data-token="text"> </span>
        <span data-token="constant">locale</span>
        <span data-token="text"> </span>
        <span data-token="keyword">=</span>
        <span data-token="text"> </span>
        <span data-token="function">useLocale</span>
        <span data-token="text">();</span>
      </span>
      <span className="line">
        <span data-token="keyword">const</span>
        <span data-token="text"> </span>
        <span data-token="constant">now</span>
        <span data-token="text"> </span>
        <span data-token="keyword">=</span>
        <span data-token="text"> </span>
        <span data-token="function">useNow</span>
        <span data-token="text">();</span>
      </span>
    </CodeSnippet>
  );
}

function buildOutput() {
  return (
    <CodeSnippet>
      <span className="line">
        <span data-token="text">$ </span>
        <span data-token="string">next build</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span data-token="comment">
          Route{'            '}Size{'       '}First load JS
        </span>
      </span>
      <span className="line">
        <span data-token="text">┌ ● /</span>
        <span data-token="text"> </span>
        <span data-token="text">{'           '}1.5 kB</span>
        <span data-token="text">{'     '}</span>
        <span data-token="string">102 kB</span>
      </span>
      <span className="line">
        <span data-token="text">├ ● /about</span>
        <span data-token="text">{'       '}</span>
        <span data-token="text">2.2 kB</span>
        <span data-token="text">{'     '}</span>
        <span data-token="string">102 kB</span>
      </span>
      <span className="line">
        <span data-token="text">└ λ /[username]</span>
        <span data-token="text">{'  '}</span>
        <span data-token="text">3.6 kB</span>
        <span data-token="text">{'     '}</span>
        <span data-token="string">104 kB</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span data-token="comment">
          ● (SSG) automatically generated as static HTML + JSON
        </span>
      </span>
    </CodeSnippet>
  );
}

function routing() {
  return (
    <CodeSnippet>
      <span className="line">
        <span data-token="text">/</span>
        <span data-token="constant">en</span>
        <span data-token="text">/blog</span>
      </span>
      <span className="line">
        <span data-token="text">/</span>
        <span data-token="constant">es</span>
        <span data-token="text">/blog</span>
      </span>
      <span className="line">
        <span data-token="text">/</span>
        <span data-token="constant">de</span>
        <span data-token="text">/blog</span>
      </span>
      <span className="line"> </span>
      <span className="line">
        <span data-token="text">/</span>
        <span data-token="constant">en</span>
        <span data-token="text">/about-us</span>
      </span>
      <span className="line">
        <span data-token="text">/</span>
        <span data-token="constant">es</span>
        <span data-token="text">/sobre-nosotros</span>
      </span>
      <span className="line">
        <span data-token="text">/</span>
        <span data-token="constant">de</span>
        <span data-token="text">/ueber-uns</span>
      </span>
    </CodeSnippet>
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
