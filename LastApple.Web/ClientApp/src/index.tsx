import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/js/all.js'
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

window.handleOpenURL = href => {
  const url = new URL(href);
  const sessionId = url.searchParams.get('sessionId');

  if (sessionId) {
      localStorage.setItem('SessionId', sessionId);

      window.location.reload();
    }
};

const cordova = window.cordova;
document.addEventListener('deviceready', function () {
    cordova.plugins.backgroundMode.enable();

    cordova.plugins.backgroundMode.onactivate = () => {};
    cordova.plugins.backgroundMode.ondeactivate = () => {};
}, false);

const rootElement = document.getElementById('root');
ReactDOM.render(
    <App />,
  rootElement);

registerServiceWorker();
