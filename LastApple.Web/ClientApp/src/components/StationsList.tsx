import React, { Component } from "react";
import { Tag } from "./Stations/Tag";
import { SingleArtist } from "./Stations/SingleArtist";
import { SimilarArtists } from "./Stations/SimilarArtists";
import { Redirect } from "react-router";
import { StationDescriptor } from "./StationDescriptor";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

export class StationsList extends Component<{}, {selectedStation: Function, isValid: boolean, triggerStationCreate: boolean, createdStationId: string}> {
    constructor(props) {
        super(props);

        this.state = { selectedStation: null, isValid: false, triggerStationCreate: false, createdStationId: null };
    }

    render(): React.ReactNode {
        if (this.state.createdStationId) {
            return <Redirect to={`/station/${this.state.createdStationId}`}/>
        }

        const SelectedStation = this.state.selectedStation;

        return <Container>
            <Row className={'clearfix'}>
                <StationDescriptor definition={SingleArtist.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={this.state.selectedStation === SingleArtist.Definition.type}/>
                <StationDescriptor definition={SimilarArtists.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={this.state.selectedStation === SimilarArtists.Definition.type}/>
                <StationDescriptor definition={Tag.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={this.state.selectedStation === Tag.Definition.type}/>
            </Row>
            {SelectedStation && <div><SelectedStation triggerCreate={this.state.triggerStationCreate}
                                                      onStationCreated={id => this.setState({ createdStationId: id })}
                                                      onOptionsChanged={x => this.setState({ isValid: x })}/>
                <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
                    <button disabled={!this.state.isValid}
                        style={{
                        margin: '10px auto',
                        background: '#100404',
                        border: 'none',
                        padding: '10px',
                        color: '#C8C8C8',
                        opacity: this.state.isValid ? 1.0 : 0.3
                    }} onClick={() => this.setState({ triggerStationCreate: true })}>Play Station
                    </button>
                </div>
            </div>}
        </Container>;
    }

    handleSelected(type: Function) {
        this.setState({ selectedStation: type });
    }
}