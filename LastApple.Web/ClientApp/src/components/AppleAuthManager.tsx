import musicKit from '../musicKit';
import { Component } from "react";
import { IMusicKit } from "./MusicKitWrapper/MusicKitDefinitions";
import * as React from "react";

export class AppleAuthManager extends Component<{}, { isAuthorized: boolean, tourMode: boolean }> {
    musicKit: IMusicKit;

    constructor(props) {
        super(props);

        this.state = { isAuthorized: true, tourMode: false };
    }

    async componentDidMount() {
        this.musicKit = await musicKit.getInstance();

        const authorized = this.musicKit.isAuthorized;

        this.setState({ isAuthorized: authorized });
    }

    async authenticate() {
        await this.musicKit.authorize();

        this.setState({ isAuthorized: this.musicKit.isAuthorized });
    }

    render() {
        if(this.state.isAuthorized || this.state.tourMode) {
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
                <span style={{
                    position: 'absolute',
                    left: '50px',
                    top: '15px',
                    color: '#E0E0E0',
                    fontSize: '150px'
                }} className={'glyphicon glyphicon-headphones'}></span>
                <h4 style={{ position: 'relative', fontWeight: 'bold' }}>Welcome to Last Apple music player</h4>
                <h5 style={{ position: 'relative', color: '#444', marginTop: '20px', marginBottom: '30px', lineHeight: 1.5 }}>
                    You need to log into your AppleMusic account to start listening. Or click Explore to take a tour and listen to track previews. Some music might be not available in this mode.
                </h5>
                <button style={{
                    border: 'none',
                    padding: '10px',
                    background: '#100404',
                    color: '#c8c8c8',
                    position: 'relative',
                    marginRight: '10px'
                }} onClick={() => this.authenticate()}>Log in</button>
                <button style={{
                    border: 'none',
                    padding: '10px',
                    background: '#100404',
                    color: '#c8c8c8',
                    position: 'relative',
                    marginLeft: '10px'
                }} onClick={() => this.setState({ tourMode: true })}>Explore</button>
            </div>
        </div>
    }
}