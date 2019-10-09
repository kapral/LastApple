import React, { Component } from "react";
import appleAuthService from '../AppleAuthService';
import lastfmAuthService from '../LastfmAuthService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import environment from "../Environment";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export class MobileAuth extends Component<{}, { appleAuth: boolean, lastfmAuth: boolean }> {
    constructor(props) {
        super(props);

        this.state = { appleAuth: false, lastfmAuth: false };
    }

    async componentDidMount() {
        await lastfmAuthService.tryGetAuthFromParams();

        const appleAuth = await appleAuthService.isAuthenticated();
        const lastfmUser = await lastfmAuthService.getAuthenticatedUser();
        const lastfmAuth = !!lastfmUser;

        this.setState({ appleAuth, lastfmAuth });
    }

    async authenticateApple() {
        await appleAuthService.authenticate();

        const appleAuth = await appleAuthService.isAuthenticated();

        this.setState({ appleAuth });
    }

    async authenticateLastfm() {
        await lastfmAuthService.authenticate();

        const lastfmAuth = !!await lastfmAuthService.getAuthenticatedUser();

        this.setState({ lastfmAuth })
    }

    backToApp() {
        window.location.href = `${environment.mobileAppSchema}?sessionId=${localStorage.getItem('SessionId')}`;
    }

    render() {
        return <Container style={{padding: '20px', maxWidth: '500px' }}>
            <Row>
                <Col xs={8}>Authenticate to Apple Music</Col>
                <Col xs={4}>
                    {this.state.appleAuth
                        ? <button className='btn btn-success' style={{ minWidth: '80px', borderRadius: '0' }} disabled><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon><span style={{ marginLeft: '5px' }}>Done</span></button>
                        : <button style={{ minWidth: '80px' }} onClick={() => this.authenticateApple()}>Log in</button>}
                </Col>
            </Row>
            <Row style={{ marginTop: '20px' }}>
                <Col xs={8}>Authenticate to Last.fm</Col>
                <Col xs={4}>
                    {this.state.lastfmAuth
                        ? <button className='btn btn-success' style={{ minWidth: '80px', borderRadius: '0' }} disabled><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon><span style={{ marginLeft: '5px' }}>Done</span></button>
                        : <button style={{ minWidth: '80px' }} onClick={() => this.authenticateLastfm()}>Log in</button>}
                </Col>
            </Row>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={() => this.backToApp()}>Return to LastApple app</button>
            </div>
        </Container>;
    }
}