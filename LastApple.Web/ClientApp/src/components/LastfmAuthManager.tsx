import {Component} from "react";
import React from "react";

export class LastfmAuthManager extends Component<{}, {authenticated: boolean}> {
    constructor(props) {
        super(props);

        this.state = {authenticated: false};
    }

    async componentDidMount() {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');


        if (token) {
            await fetch(`api/lastfm/auth?token=${token}`, {method: 'POST'});
            this.setState({authenticated: true});
            document.location.search = '';
        }

        const authStateResponse = await fetch('api/lastfm/auth/state');

        this.setState({authenticated: await authStateResponse.json()});
    }

    async authenticate() {
        const authUrlResponse = await fetch(`api/lastfm/auth?redirectUrl=${window.location.href}`);

        window.location.href = await authUrlResponse.json();
    }

    render(): React.ReactNode {
        return <div>
            {!this.state.authenticated &&
            <a onClick={() => this.authenticate()}>Authenticate to Last.fm</a>}
        </div>
    }
}