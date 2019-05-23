import React, { Component } from 'react';
import { Route, Router } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Play } from './components/Play';
import { AppleAuthManager } from "./components/AppleAuthManager";
import { Header } from "./components/Header";
import { Provider } from "mobx-react";
import { AppState } from "./AppState";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import createBrowserHistory from "history/createBrowserHistory";
import * as MobxReactRouter from "mobx-react-router";

export default class App extends Component<{}> {
    displayName = App.name
    private readonly stores: { routing: MobxReactRouter.RouterStore; appState: AppState };
    private readonly history: MobxReactRouter.SynchronizedHistory;

    constructor(props) {
        super(props);

        const browserHistory = createBrowserHistory();
        const routingStore = new RouterStore();
        this.history = syncHistoryWithStore(browserHistory, routingStore);

        this.stores = {
            routing: routingStore,
            appState: new AppState()
        };
    }

    render() {
        return (
            <Provider {...this.stores}>
                <Router history={this.history}>
                    <Layout>
                        <Route component={Header} />
                        <AppleAuthManager/>
                        <Route exact path='/' component={Home}/>
                        <Route exact path='/station/:station' component={Play}/>
                    </Layout>
                </Router>
            </Provider>
        );
    }
}
