import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import {IntlProvider} from 'use-intl';
import en from '../messages/en.json';
import App from './App.tsx';

// You can get the messages from anywhere you like. You can also
// fetch them from within a component and then render the provider
// along with your app once you have the messages.
const messages = en;

const node = document.getElementById('root');

ReactDOM.createRoot(node!).render(
  <StrictMode>
    <IntlProvider locale="en" messages={messages}>
      <App user={{name: 'Jane'}} />
    </IntlProvider>
  </StrictMode>
);
