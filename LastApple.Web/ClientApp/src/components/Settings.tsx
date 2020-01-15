import React, { Component } from "react";
import appleAuthService from '../AppleAuthService';
import lastfmAuthService from '../LastfmAuthService';
import environment from "../Environment";
import appleMusicLogo from '../images/apple-music-logo.png';
import lastfmLogo from '../images/lastfm-logo.png';
import { Spinner } from 'react-bootstrap';
import ReactSwitch from "react-switch";
import { inject, observer } from "mobx-react";
import { BaseRouterProps } from "../BaseRouterProps";

const rowStyles: React.CSSProperties = { flex: 1, display: 'flex', padding: '20px', alignItems: 'center', borderBottom: '1px solid #333' };
const logoStyles: React.CSSProperties = { height: '30px', marginRight: '15px' };

interface SettingsProps extends BaseRouterProps {
    appConnect: boolean;
}

@inject('appState')
@observer
export class Settings extends Component<SettingsProps, { loading: boolean, appleAuth: boolean, lastfmAuth: boolean }> {
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
    }

    async authenticateApple() {
        if (this.state.appleAuth) {
            await appleAuthService.logout();
            
            this.setState({ appleAuth: false });
            return;
        }
        
        await appleAuthService.authenticate();

        const appleAuth = await appleAuthService.isAuthenticated();

        this.setState({ appleAuth });
    }

    async authenticateLastfm() {
        if (this.state.lastfmAuth) {
            await lastfmAuthService.logout();
            
            this.setState({ lastfmAuth: false });
            this.props.appState.lastfmAuthenticated = false;
            return;
        }
        await lastfmAuthService.authenticate();

        const lastfmAuth = !!await lastfmAuthService.getAuthenticatedUser();

        this.setState({ lastfmAuth })
    }
    
    render() {
        if (this.state.loading)
            return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <Spinner animation="border" />
            </div>;
        
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={rowStyles}>
                <img style={logoStyles} src={appleMusicLogo} />
                <div style={{ flex: 1 }}>Apple Music account</div>
                <ReactSwitch
                    checked={this.state.appleAuth}
                    onChange={x => this.authenticateApple()}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={22}
                    width={44}
                    offColor={'#888'}
                    onColor={'#8e0000'}
                />
            </div>
            <div style={rowStyles}>
                <img style={logoStyles} src={lastfmLogo} />
                <div style={{ flex: 1 }}>Last.fm account</div>
                <ReactSwitch
                    checked={this.state.lastfmAuth}
                    onChange={x => this.authenticateLastfm()}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={22}
                    width={44}
                    offColor={'#888'}
                    onColor={'#8e0000'}
                />
            </div>
            { this.props.appConnect &&
                <a className={'btn btn-black'} style={{ alignSelf: 'center', margin: '20px 0' }} href={`${environment.mobileAppSchema}?sessionId=${localStorage.getItem('SessionId')}`}>Back to LastApple app</a>}
        </div>;
    }
}