import { Component } from "react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphonesAlt } from "@fortawesome/free-solid-svg-icons";
import environment from '../Environment';
import appleAuthService from '../AppleAuthService';

export class AppleAuthManager extends Component<{}, { isAuthorized: boolean, tourMode: boolean }> {
    constructor(props) {
        super(props);

        this.state = { isAuthorized: true, tourMode: false };
    }

    async componentDidMount() {
        if (!await appleAuthService.isAuthenticated()) {
            await appleAuthService.tryGetExistingAuthentication();
        }

        this.setState({ isAuthorized: await appleAuthService.isAuthenticated() });
    }

    async authenticate() {
        if (environment.isMobile) {
            window.location.href = `${environment.baseUrl}#/mobileauth`;
            return;
        }

        await appleAuthService.authenticate();

        this.setState({ isAuthorized: await appleAuthService.isAuthenticated() });
    }

    render() {
        if (this.state.isAuthorized || this.state.tourMode) {
            return null;
        }

        return <div style={{
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            background: '#000000BB',
            zIndex: 1000
        }}>
            <div style={{
                margin: '50px auto 0',
                background: '#FFF',
                color: '#000',
                width: '80%',
                minWidth: '400px',
                maxWidth: '600px',
                padding: '30px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <FontAwesomeIcon style={{
                    position: 'absolute',
                    left: '50px',
                    top: '15px',
                    color: '#E0E0E0',
                    fontSize: '160px'
                }} icon={faHeadphonesAlt}/>
                <h5 style={{ position: 'relative', fontWeight: 'bold', marginTop: '10px' }}>Welcome to Last Apple music player</h5>
                <h6 style={{ position: 'relative', color: '#444', marginTop: '20px', marginBottom: '30px', lineHeight: 1.5 }}>
                    You need to log into your AppleMusic account to start listening. Or click Explore to take a tour and listen to track previews. Some music might be not available in this mode.
                </h6>
                <button style={{
                    position: 'relative',
                    marginRight: '10px'
                }} onClick={() => this.authenticate()}>Log in</button>
                <button style={{
                    position: 'relative',
                    marginLeft: '10px'
                }} onClick={() => this.setState({ tourMode: true })}>Explore</button>
            </div>
        </div>
    }
}