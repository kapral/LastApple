import React, { Component } from 'react';
import { IStationDefinition } from './IStationDefinition';
import { Redirect } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { IStationParams } from './IStationParams';

interface DescriptorProps {
    definition: IStationDefinition;
    StationComponent: React.ComponentType<IStationParams>;
}

const descriptorStyles: React.CSSProperties = {
    margin: '5px',
    padding: '15px',
    background: '#00000099',
    cursor: 'pointer',
    flex: 1
};
const descriptorTitleStyles: React.CSSProperties = {
    marginTop: '10px',
    fontSize: '15px',
    textAlign: 'center',
    color: '#EEE'
};

export class StationDescriptor extends Component<DescriptorProps, { isValid: boolean, triggerStationCreate: boolean, createdStationId: string }> {
    constructor(props) {
        super(props);

        this.state = {
            isValid: false,
            triggerStationCreate: false,
            createdStationId: null
        };
    }

    render(): React.ReactNode {
        if (this.state.createdStationId) {
            return <Redirect to={`/station/${this.state.createdStationId}`}/>
        }

        return <div className={'station-descriptor'} style={descriptorStyles}>
            <h4 style={descriptorTitleStyles}>{this.props.definition.title}</h4>
                <div style={{ color: '#AAA' }}>{this.props.definition.description}</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <this.props.StationComponent
                        triggerCreate={this.state.triggerStationCreate}
                        onStationCreated={id => this.setState({ createdStationId: id })}
                        onOptionsChanged={x => this.handleOptionsChanged(x)} />
                    <span onClick={() => this.handleStationCreate()}>
                        <FontAwesomeIcon style={{ color: this.state.isValid ? '#8e0000' : '#333' }} icon={faArrowCircleRight} size='2x' />
                    </span>
                </div>
            </div>;
    }

    handleStationCreate() {
        if (!this.state.isValid)
            return;

        this.setState({ triggerStationCreate: true });
    }

    handleOptionsChanged(isValid) {
        if (this.state.isValid !== isValid) {
            this.setState({ isValid });
        }
    }
}