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
        
        const authenticated = await appleAuthService.isAuthenticated();

        this.setState({ isLoading: false, isAuthenticated: authenticated });
    }

    render() {
        if (!this.props.showWarning || this.state.isLoading || this.state.isAuthenticated) {
            return null;
        }

        return <UnauthenticatedWarning/>
    }
}