import {Component} from "react";
import React from "react";
import { BaseProps } from "../BaseProps";
import lastfmAuthService from '../LastfmAuthService';
import environment from "../Environment";

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
        await lastfmAuthService.tryGetAuthFromParams();

        const user = await lastfmAuthService.getAuthenticatedUser();

        this.setState({ pending: false, user });

        this.props.appState.lastfmAuthenticated = !!user;
    }

    async authenticate() {
        if (environment.isMobile) {
            window.location.href = `${environment.baseUrl}#/mobileauth`;
        }

        await lastfmAuthService.authenticate();
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
            </div>;

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
        </div>;
    }
}