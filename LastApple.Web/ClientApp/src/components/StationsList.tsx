import React, { Component } from "react";

export class StationsList extends Component<{}> {
    render(): React.ReactNode {
        return <div>
            <h3 style={{ marginTop: '10px', marginBottom: '20px' }}>Select what you would like to listen to</h3>
            {this.props.children}
        </div>
    }
}