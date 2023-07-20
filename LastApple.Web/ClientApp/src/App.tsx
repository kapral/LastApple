import React, { Component } from 'react';
import { matchPath, Route, BrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Play } from './components/Play';
import { Header } from "./components/Header";
import { Settings } from "./components/Settings";
import { BaseRouterProps } from "./BaseRouterProps";
import { AppleAuthManager } from "./components/AppleAuthManager";
import { PrivacyPolicy } from './components/PrivacyPolicy';

export default class App extends Component<{}, { showPlayer: boolean }> {
    displayName = App.name;

    privacyRoute = '/privacy';

    noNavRoutes = [this.privacyRoute];

    shouldShowNav = (route: string) => !this.noNavRoutes.some(r => route.includes(r));

    constructor(props) {
        super(props);

        this.state = { showPlayer: false };
    }

    render() {
        return (
            <BrowserRouter>
                <Layout>
                    <Route render={(props: BaseRouterProps) =>
                        <Header
                            {...props}
                            showNav={this.shouldShowNav(props.location.pathname)}
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
                    <Route exact path='/settings' render={(props: BaseRouterProps) => <Settings {...props} />} />
                    <Route exact path={this.privacyRoute} component={PrivacyPolicy} />
                </Layout>
            </BrowserRouter>
        );
    }
}