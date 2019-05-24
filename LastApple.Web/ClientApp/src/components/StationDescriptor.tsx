import React, { Component } from "react";
import { IStationDefinition } from "./IStationDefinition";

export class StationDescriptor extends Component<{ definition: IStationDefinition, selected: boolean, onSelected(type: Function): void }> {
    constructor(props) {
        super(props);

        this.state = { selected: false };
    }

    render(): React.ReactNode {
        return <div className={'col-md-4'}>
            <div className={'station-descriptor'} onClick={() => this.handleSelected()}
                 style={{
                     margin: '10px 0',
                     padding: '15px',
                     background: !this.props.selected ? '#00000099' : '#000',
                     cursor: 'pointer',
                     height: '110px'
                 }}><h4 style={{ fontSize: '15px', textAlign: 'center', color: '#EEE' }}>{this.props.definition.title}</h4>
                <div style={{ color: '#AAA' }}>{this.props.definition.description}</div>
            </div>
        </div>
    }

    handleSelected() {
        this.props.onSelected(this.props.definition.type);
        this.setState({ selected: true });
    }
}