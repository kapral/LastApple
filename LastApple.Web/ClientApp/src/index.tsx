import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/js/all.js'
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import env from './Environment';
import { playbackEventMediator } from './PlaybackEventMediator';

window.handleOpenURL = href => {
    const url = new URL(href);
    const sessionId = url.searchParams.get('sessionId');

    if (sessionId) {
        setTimeout(() => {
            window.SafariViewController.hide();
            localStorage.setItem('SessionId', sessionId);

            window.location.reload();
        }, 0);
    }
};

const cordova = window.cordova;
document.addEventListener('deviceready', function () {
    playbackEventMediator.subscribePlayStart(() => cordova.plugins.backgroundMode.enable());
    playbackEventMediator.subscribePlayEnd(() => cordova.plugins.backgroundMode.disable());

    cordova.plugins.backgroundMode.onactivate = () => {};
    cordova.plugins.backgroundMode.ondeactivate = () => {};
}, false);

const rootElement = document.getElementById('root');

if (env.isMobile)
    rootElement.classList.add('mobile');

ReactDOM.render(
    <App />,
  rootElement);

registerServiceWorker();
