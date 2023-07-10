import React, { Component } from "react";
import appleAuthService from '../AppleAuthService';
import lastfmAuthService from '../LastfmAuthService';
import environment from "../Environment";
import appleMusicLogo from '../images/apple-music-logo.png';
import lastfmLogo from '../images/lastfm-logo.png';
import { Spinner } from 'react-bootstrap';
import ReactSwitch from "react-switch";
import { BaseRouterProps } from "../BaseRouterProps";
import { MobileUtil } from '../Mobile/MobileUtil';
import { AppContext } from '../AppContext';

const rowStyles: React.CSSProperties = { flex: 1, display: 'flex', padding: '20px', alignItems: 'center', borderBottom: '1px solid #333' };
const logoStyles: React.CSSProperties = { height: '30px', marginRight: '15px' };

interface SettingsProps extends BaseRouterProps {
    appConnect: boolean;
}

export class Settings extends Component<SettingsProps, { loading: boolean, appleAuth: boolean, lastfmAuth: boolean }> {
    static contextType = AppContext;
    context: React.ContextType<typeof AppContext>;

    constructor(props) {
        super(props);

        this.state = { loading: true, appleAuth: false, lastfmAuth: false };
    }

    async componentDidMount() {
        this.setState({ loading: true });
        await lastfmAuthService.tryGetAuthFromParams();

        const appleAuth = await appleAuthService.isAuthenticated();
        const lastfmUser = await lastfmAuthService.getAuthenticatedUser();
        const lastfmAuth = !!lastfmUser;

        this.setState({ loading: false, appleAuth, lastfmAuth });
        this.handleAutoRedirectToApp();

        if (this.props.match.params['source'] === 'apple' && !appleAuth)
            await this.authenticateApple();

        if (this.props.match.params['source'] === 'lastfm' && !lastfmAuth)
            await this.authenticateLastfm();
    }

    async authenticateApple() {
        if (this.state.appleAuth) {
            await appleAuthService.logout();

            this.setState({ appleAuth: false });
            return;
        }

        if (environment.isMobile) {
            this.openWebAppInViewController('apple');
            return;
        }

        await appleAuthService.authenticate();

        const appleAuth = await appleAuthService.isAuthenticated();

        this.setState({ appleAuth });
        this.handleAutoRedirectToApp();
    }

    handleAutoRedirectToApp() {
        if (this.props.appConnect && this.state.appleAuth && this.state.lastfmAuth)
            window.location.assign(MobileUtil.formatAppUrl());
    }

    async authenticateLastfm() {
        if (this.state.lastfmAuth) {
            await lastfmAuthService.logout();

            this.setState({ lastfmAuth: false });
            this.context.setLastfmAuthenticated(false);
            return;
        }

        if (environment.isMobile) {
            this.openWebAppInViewController('lastfm');
            return;
        }

        await lastfmAuthService.authenticate();

        const lastfmAuth = !!await lastfmAuthService.getAuthenticatedUser();

        this.setState({ lastfmAuth });
    }

    render() {
        if (this.state.loading)
            return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <Spinner animation="border" />
            </div>;

        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#0E0E0E', padding: '10px 25px'  }}>Connected accounts</div>
            <div style={rowStyles}>
                <img style={logoStyles} src={appleMusicLogo} alt='Apple Music Logo' />
                <div style={{ flex: 1 }}>Apple Music</div>
                <ReactSwitch
                    checked={this.state.appleAuth}
                    onChange={() => this.authenticateApple()}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={22}
                    width={44}
                    offColor={'#888'}
                    onColor={'#8e0000'}
                />
            </div>
            <div style={rowStyles}>
                <img style={logoStyles} src={lastfmLogo} alt='Last.fm logo' />
                <div style={{ flex: 1 }}>Last.fm</div>
                <ReactSwitch
                    checked={this.state.lastfmAuth}
                    onChange={() => this.authenticateLastfm()}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={22}
                    width={44}
                    offColor={'#888'}
                    onColor={'#8e0000'}
                />
            </div>
        </div>;
    }

    openWebAppInViewController(source: string) {
        window.SafariViewController.show({
                url: `${environment.websiteUrl}settings/app/${source}`
            },
            result => {
                if (result.event === 'closed')
                    window.SafariViewController.show({
                        url: `${environment.websiteUrl}settings/capturesessionid`,
                        hidden: true
                    });
                    this.setState({ loading: true });
            });
    }
}