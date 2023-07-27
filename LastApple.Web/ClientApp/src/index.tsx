import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/js/all.js'
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import registerServiceWorker from './registerServiceWorker';
import { assertNonNullable } from './utils/mics';
import { LastfmContextProvider } from "./lastfm/LastfmContext";
import { AppContextProvider } from "./AppContext";
import { AppleContextProvider } from "./apple/AppleContext";

const rootElement = document.getElementById('root');
assertNonNullable(rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
    <AppleContextProvider>
        <LastfmContextProvider>
            <AppContextProvider>
                <App />
            </AppContextProvider>
        </LastfmContextProvider>
    </AppleContextProvider>
);

registerServiceWorker();
