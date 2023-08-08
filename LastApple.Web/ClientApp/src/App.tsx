import React from 'react';
import {BrowserRouter, matchPath, Route, RouteComponentProps, Switch} from 'react-router-dom';
import {Layout} from './components/Layout';
import {Home} from './components/Home';
import {Settings} from "./components/Settings";
import {PrivacyPolicy} from './components/PrivacyPolicy';
import {useStartupAppleAuthenticationCheck} from "./hooks/useStartupAppleAuthenticationCheck";
import {useStartupLastfmAuthenticationCheck} from "./hooks/useStartupLastfmAuthenticationCheck";
import {homeRoute, privacyRoute, settingsRoute, stationRoute} from "./routes";
import {NowPlaying} from "./components/NowPlaying";

export const App: React.FunctionComponent = () => {
    useStartupAppleAuthenticationCheck();
    useStartupLastfmAuthenticationCheck();

    return (
        <BrowserRouter>
            <Layout>
                <Route path={homeRoute} exact component={Home}/>
                <Route path={settingsRoute} exact component={Settings} />
                <Route path={privacyRoute} exact component={PrivacyPolicy} />

                <Route render={(props: RouteComponentProps) => {
                        const match = matchPath(props.location.pathname, {
                            path: stationRoute,
                            exact: true,
                            strict: false
                        });

                        const stationId = match && match.params['stationId'];

                        return <NowPlaying stationId={stationId} showPlayer={!!match} />;
                    }}
                />
            </Layout>
        </BrowserRouter>
    )
}