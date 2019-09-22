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
import * as MobxReactRouter from "mobx-react-router";
import createHashHistory from "history/createHashHistory";
import { MobileAuth } from "./components/MobileAuth";
import { BaseRouterProps } from "./BaseRouterProps";

export default class App extends Component<{}> {
    displayName = App.name
    private readonly stores: { routing: MobxReactRouter.RouterStore; appState: AppState };
    private readonly history: MobxReactRouter.SynchronizedHistory;

    constructor(props) {
        super(props);

        const browserHistory = createHashHistory();
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
                        <Route render={(props: BaseRouterProps) =>
                            <Header {...props} showNav={!props.location.pathname.includes('/mobileauth')} />
                        } />
                        <Route render={({location}) => {
                            return location.pathname.includes('/mobileauth')
                                ? null
                                : <AppleAuthManager/>
                        }} />
                        <Route exact path='/' component={Home}/>
                        <Route exact path='/station/:station' component={Play}/>
                        <Route exact path='/mobileauth' component={MobileAuth} />
                    </Layout>
                </Router>
            </Provider>
        );
    }
}
