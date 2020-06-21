import React, { Component } from 'react';
import { matchPath, Route, Router } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Play } from './components/Play';
import { Header } from "./components/Header";
import { Provider } from "mobx-react";
import { AppState } from "./AppState";
import * as MobxReactRouter from "mobx-react-router";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import createHashHistory from "history/createHashHistory";
import createBrowserHistory from "history/createBrowserHistory";
import { Settings } from "./components/Settings";
import { BaseRouterProps } from "./BaseRouterProps";
import { AppleAuthManager } from "./components/AppleAuthManager";
import env from './Environment';
import { MobileNav } from './components/Mobile/MobileNav';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CaptureSessionId } from './components/Mobile/CaptureSessionId';

export default class App extends Component<{}, { showPlayer: boolean }> {
    displayName = App.name;
    private readonly stores: { routing: MobxReactRouter.RouterStore; appState: AppState };
    private readonly history: MobxReactRouter.SynchronizedHistory;

    mobileSettingsRoute = '/settings/app';
    sessionCaptureRoute = '/settings/capturesessionid';
    privacyRoute = '/privacy';

    noNavRoutes = [this.mobileSettingsRoute, this.privacyRoute, this.sessionCaptureRoute];

    shouldShowNav = (route: string) => !this.noNavRoutes.some(r => route.includes(r));

    constructor(props) {
        super(props);

        this.state = { showPlayer: false };

        const browserHistory = env.isMobile ? createHashHistory() : createBrowserHistory();
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
                            <Header
                                {...props}
                                showNav={this.shouldShowNav(props.location.pathname) && !env.isMobile}
                                showLastfm={this.shouldShowNav(props.location.pathname)}
                            />
                        }/>
                        <Route render={(props: BaseRouterProps) =>
                            <AppleAuthManager showWarning={!props.location.pathname.includes('/settings')} />
                        }/>
                        <Route exact path='/' component={Home}/>
                        <Route render={(props: BaseRouterProps) => {
                            const match = matchPath(props.history.location.pathname, {
                                path: '/station/:station',
                                exact: true,
                                strict: false
                            });
                            const stationId = match && match.params['station'];

                            return <Play {...props}
                                         stationId={stationId}
                                         showPlayer={props.location.pathname.includes('/station/')}
                            />;
                        }}/>
                        <Route exact path='/settings' render={(props: BaseRouterProps) => <Settings {...props} appConnect={false} />} />
                        <Route exact path={`${this.mobileSettingsRoute}/:source`} render={(props: BaseRouterProps) => <Settings {...props} appConnect={true} />} />
                        <Route render={(props: BaseRouterProps) => <>{env.isMobile && <MobileNav {...props} />}</>} />
                        <Route exact path={this.sessionCaptureRoute} component={CaptureSessionId} />
                        <Route exact path={this.privacyRoute} component={PrivacyPolicy} />
                        {!env.isMobile && <Footer/>}
                    </Layout>
                </Router>
            </Provider>
        );
    }
}

