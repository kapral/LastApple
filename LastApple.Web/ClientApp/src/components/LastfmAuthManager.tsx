import {Component} from "react";
import React from "react";
import lastfmAuthService from '../LastfmAuthService';
import { Spinner } from 'react-bootstrap';
import lastfmLogo from '../images/lastfm-logo.png'
import { BaseRouterProps } from '../BaseRouterProps';
import { withRouter } from 'react-router-dom'
import { AppContext } from '../AppContext';

interface LastfmUser {
    name: string;
    url: string;
    avatar: Array<string>
}

interface ILastfmAuthManagerProps extends BaseRouterProps {
    readonly lastfmAuthenticated: boolean;
}

class LastfmAuthManager extends Component<ILastfmAuthManagerProps, { pending: boolean, user: LastfmUser }> {
    static contextType = AppContext;
    context: React.ContextType<typeof AppContext>;

    constructor(props) {
        super(props);

        this.state = { pending: true, user: null };
    }

    async componentDidMount() {
        await this.refreshAuth();
    }

    async refreshAuth() {
        this.context.setCheckingLastfmAuth(true);

        await lastfmAuthService.tryGetAuthFromParams();

        const user = await lastfmAuthService.getAuthenticatedUser();

        this.setState({ pending: false, user });

        this.context.setLastfmAuthenticated(!!user);
        this.context.setCheckingLastfmAuth(false);
    }

    async authenticate() {
        if (this.state.user)
            return;

        this.props.history.push('/settings');
    }

    async componentDidUpdate(prevProps: Readonly<ILastfmAuthManagerProps>, prevState: Readonly<{ pending: boolean; user: LastfmUser }>, snapshot?: any): Promise<void> {
        if (this.props.lastfmAuthenticated !== prevProps.lastfmAuthenticated)
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
               href={this.state.user && `https://www.last.fm/user/${this.state.user.name}`}
               title={'Open lastfm profile'}
               target="_blank" rel="noopener noreferrer"
               onClick={() => this.authenticate()}>
                <img alt={''} style={{ borderRadius: '20px' }} src={(this.state.user && this.state.user.avatar[0]) || lastfmLogo} />
                <span>{(this.state.user && this.state.user.name) || 'Log in'}</span>
            </a>
        </div>;
    }
}

export default withRouter(LastfmAuthManager);