import { Component } from "react";
import * as React from "react";
import appleAuthService from '../AppleAuthService';
import { UnauthenticatedWarning } from "./UnauthenticatedWarning";

export class AppleAuthManager extends Component<{ showWarning: boolean }, { isLoading: boolean, isAuthenticated: boolean }> {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isAuthenticated: true
        };
    }

    async componentDidMount() {
        this.setState({ isLoading: true });
        
        if (!await appleAuthService.isAuthenticated()) {
            await appleAuthService.tryGetExistingAuthentication();
        }

        this.setState({ isLoading: false, isAuthenticated: await appleAuthService.isAuthenticated() });
    }

    render() {
        if (!this.props.showWarning || this.state.isLoading || this.state.isAuthenticated) {
            return null;
        }

        return <UnauthenticatedWarning/>
    }
}