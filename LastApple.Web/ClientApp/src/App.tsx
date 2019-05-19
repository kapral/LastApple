import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Play } from './components/Play';
import { LastfmAuthManager } from "./components/LastfmAuthManager";
import { AppleAuthManager } from "./components/AppleAuthManager";
import { Header } from "./components/Header";

export default class App extends Component {
    displayName = App.name

    render() {
        return (
            <Layout>
                <Header/>
                <AppleAuthManager/>
                <Route exact path='/' component={Home}/>
                <Route exact path='/station/:station' component={Play}/>
            </Layout>
        );
    }
}
