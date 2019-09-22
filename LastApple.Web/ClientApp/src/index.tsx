import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/js/all.js'
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

(window as any).handleOpenURL = function(href) {
  const url = new URL(href);
  const sessionId = url.searchParams.get('sessionId');

  if (sessionId) {
      localStorage.setItem('SessionId', sessionId);

      window.location.reload();
    }
};

const rootElement = document.getElementById('root');

ReactDOM.render(
    <App />,
  rootElement);

registerServiceWorker();
