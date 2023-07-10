import React, { Component } from 'react';
import { matchPath, Route, BrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Play } from './components/Play';
import { Header } from "./components/Header";
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

    mobileSettingsRoute = '/settings/app';
    sessionCaptureRoute = '/settings/capturesessionid';
    privacyRoute = '/privacy';

    noNavRoutes = [this.mobileSettingsRoute, this.privacyRoute, this.sessionCaptureRoute];

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
            </BrowserRouter>
        );
    }
}