import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/js/all.js'
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import environment from './components/Environment';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter basename={environment.baseUrl}>
    <App />
  </BrowserRouter>,
  rootElement);

registerServiceWorker();
