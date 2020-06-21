import {Component} from "react";
import React from "react";
import lastfmAuthService from '../LastfmAuthService';
import { Spinner } from 'react-bootstrap';
import { observer } from "mobx-react";
import lastfmLogo from '../images/lastfm-logo.png'
import { BaseRouterProps } from '../BaseRouterProps';
import { withRouter } from 'react-router-dom'

interface Image {
    size: string;
    url: string;
}

interface LastfmUser {
    name: string;
    url: string;
    image: Array<Image>
}

@observer
class LastfmAuthManager extends Component<BaseRouterProps, { pending: boolean, user: LastfmUser }> {
    constructor(props) {
        super(props);

        this.state = { pending: true, user: null };
    }

    async componentDidMount() {
        await this.refreshAuth();
    }

    async refreshAuth() {
        this.props.appState.checkingLastfmAuth = true;

        await lastfmAuthService.tryGetAuthFromParams();

        const user = await lastfmAuthService.getAuthenticatedUser();

        this.setState({ pending: false, user });

        this.props.appState.lastfmAuthenticated = !!user;
        this.props.appState.checkingLastfmAuth = false;
    }

    async authenticate() {
        if (this.state.user)
            return;

        this.props.history.push('/settings');
    }

    async componentDidUpdate(prevProps: Readonly<BaseRouterProps>, prevState: Readonly<{ pending: boolean; user: LastfmUser }>, snapshot?: any): Promise<void> {
        if (this.props.appState.lastfmAuthenticated !== prevProps.appState.lastfmAuthenticated)
            await this.refreshAuth();
    }

    render(): React.ReactNode {
        if(this.state.pending)
            return <div style={{ marginRight: '15px' }}>
                <Spinner animation="border" style={{ width: '20px', height: '20px' }} />
            </div>;

        return <div>
            <a style={{
                color: '#DDD',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
               className='lastfm-profile'
               href={this.state.user && this.state.user.url}
               title={'Open lastfm profile'}
               target="_blank" rel="noopener noreferrer"
               onClick={() => this.authenticate()}>
                <img alt={''} style={{ borderRadius: '20px' }} src={(this.state.user && this.state.user.image[0].url) || lastfmLogo} />
                <span>{(this.state.user && this.state.user.name) || 'Log in'}</span>
            </a>
        </div>;
    }
}

export default withRouter(LastfmAuthManager);