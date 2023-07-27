import React from 'react';
import {BrowserRouter, matchPath, Route} from 'react-router-dom';
import {Layout} from './components/Layout';
import {Home} from './components/Home';
import {Play} from './components/Play';
import {Header} from "./components/Header";
import {Settings} from "./components/Settings";
import {BaseRouterProps} from "./BaseRouterProps";
import {PrivacyPolicy} from './components/PrivacyPolicy';
import {useStartupAppleAuthenticationCheck} from "./hooks/useStartupAppleAuthenticationCheck";
import {AppleUnauthenticatedWarning} from "./components/AppleUnauthenticatedWarning";
import {useStartupLastfmAuthenticationCheck} from "./hooks/useStartupLastfmAuthenticationCheck";

export const settingsRoute = '/settings';
export const privacyRoute = '/privacy';
export const noNavRoutes = [privacyRoute];

function shouldShowNav(route: string) {
    return !noNavRoutes.some(r => route.includes(r));
}

export const App: React.FunctionComponent = () => {
    useStartupAppleAuthenticationCheck();
    useStartupLastfmAuthenticationCheck();

    return (
        <BrowserRouter>
            <Layout>
                <Route render={(props: BaseRouterProps) =>
                    <Header
                        {...props}
                        showNav={shouldShowNav(props.location.pathname)}
                        showLastfm={shouldShowNav(props.location.pathname)}
                    />
                }/>
                <Route component={AppleUnauthenticatedWarning} />
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
                <Route exact path={settingsRoute} component={Settings} />
                <Route exact path={privacyRoute} component={PrivacyPolicy} />
            </Layout>
        </BrowserRouter>
    )
}