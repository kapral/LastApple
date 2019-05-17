import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Play } from './components/Play';
import { LastfmAuthManager } from "./components/LastfmAuthManager";
import { AppleAuthManager } from "./components/AppleAuthManager";

export default class App extends Component {
    displayName = App.name

    render() {
        return (
            <Layout>
                <AppleAuthManager/>
                <LastfmAuthManager/>
                <Route exact path='/' component={Home}/>
                <Route exact path='/station/:station' component={Play}/>
            </Layout>
        );
    }
}
