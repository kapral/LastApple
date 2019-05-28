import React, { Component } from 'react';
import { StationsList } from "./StationsList";
import { inject } from "mobx-react";
import { BaseProps } from "../BaseProps";

@inject('appState')
export class Home extends Component<BaseProps> {
    render() {
        return <div>
            <StationsList appState={this.props.appState} />
        </div>;
    }
}
