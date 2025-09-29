const {extractMessages} = require('../dist/extractor/index.js');

const sourceCode = `
  import { useExtracted } from 'next-intl';
  
  function MyComponent() {
    const t = useExtracted();
    return (
      <div>
        <h1>{t('Hello {name}', {name: 'Jane'})}</h1>
        <p>{t('How are you?')}</p>
      </div>
    );
  }
`;

const messages = extractMessages(sourceCode);
console.log(JSON.stringify(messages, null, 2));
