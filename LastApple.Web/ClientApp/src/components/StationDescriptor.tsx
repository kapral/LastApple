import React, { Component } from "react";
import { IStationDefinition } from "./IStationDefinition";
import { Col } from "react-bootstrap";

export class StationDescriptor extends Component<{ definition: IStationDefinition, selected: boolean, onSelected(type: Function): void }> {
    render(): React.ReactNode {
        return <Col md={3}>
            <div className={'station-descriptor'} onClick={() => this.handleSelected()}
                 style={{
                     margin: '5px 0',
                     padding: '15px',
                     background: !this.props.selected ? '#00000099' : '#000',
                     cursor: 'pointer',
                     height: '110px'
                 }}><h4 style={{ marginTop: '10px', fontSize: '15px', textAlign: 'center', color: '#EEE' }}>{this.props.definition.title}</h4>
                <div style={{ color: '#AAA' }}>{this.props.definition.description}</div>
            </div>
        </Col>
    }

    handleSelected() {
        this.props.onSelected(this.props.definition.type);
    }
}