import {Component} from "react";
import React from "react";
import { BaseProps } from "../BaseProps";

interface Image {
    size: string;
    url: string;
}

interface LastfmUser {
    name: string;
    url: string;
    image: Array<Image>
}

export class LastfmAuthManager extends Component<BaseProps, { pending: boolean, user: LastfmUser }> {
    constructor(props) {
        super(props);

        this.state = { pending: true, user: null };
    }

    async componentDidMount() {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');


        if (token) {
            await fetch(`api/lastfm/auth?token=${token}`, {method: 'POST'});
            document.location.search = '';
        }

        const userResponse = await fetch('api/lastfm/auth/user');
        const user = await userResponse.json();

        this.setState({ pending: false, user });

        this.props.appState.lastfmAuthenticated = !!user;
    }

    async authenticate() {
        const authUrlResponse = await fetch(`api/lastfm/auth?redirectUrl=${window.location.href}`);

        window.location.href = await authUrlResponse.json();
    }

    render(): React.ReactNode {
        if(this.state.pending)
            return null;

        if (this.state.user)
            return <div>
                <a style={{
                    color: '#DDD',
                    padding: '2px 10px',
                    textDecoration: 'none',
                    display: 'block'
                }} href={this.state.user.url}
                   title={'Open lastfm profile'}
                   target="_blank" rel="noopener noreferrer">
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', width: 'calc(100% - 35px)' }}>{this.state.user.name}</span>
                    <img alt={''} style={{ borderRadius: '20px', marginLeft: '10px', height: '25px', verticalAlign: 'top' }} src={this.state.user.image[0].url} />
                </a>
            </div>

        return <div>
            <a className={'lastfm-connect-link'} style={{
                color: '#DDD',
                padding: '10px',
                textDecoration: 'none'
            }}
               onClick={() => this.authenticate()}>
                <span className={'large-screen-label'}>Connect your last.fm account</span>
                <span className={'small-screen-label'}>Log in to last.fm</span>
            </a>
        </div>
    }
}