import React, { Component } from "react";
import { Tag } from "./Stations/Tag";
import { SingleArtist } from "./Stations/SingleArtist";
import { SimilarArtists } from "./Stations/SimilarArtists";
import { Redirect } from "react-router";
import { StationDescriptor } from "./StationDescriptor";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { MyLibrary } from "./Stations/MyLibrary";
import { BaseProps } from "../BaseProps";
import { observer } from "mobx-react";

@observer
export class StationsList extends Component<BaseProps, {selectedStation: Function, isValid: boolean, triggerStationCreate: boolean, createdStationId: string}> {
    constructor(props) {
        super(props);

        this.state = { selectedStation: null, isValid: false, triggerStationCreate: false, createdStationId: null };
    }

    render(): React.ReactNode {
        if (this.state.createdStationId) {
            return <Redirect to={`/station/${this.state.createdStationId}`}/>
        }

        const SelectedStation = this.state.selectedStation && observer(this.state.selectedStation as any) as Function;

        return <Container>
            <Row className={'clearfix'} style={{ padding: '5px' }}>
                <StationDescriptor definition={MyLibrary.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={SelectedStation === MyLibrary.Definition.type}/>
                <StationDescriptor definition={SingleArtist.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={SelectedStation === SingleArtist.Definition.type}/>
                <StationDescriptor definition={SimilarArtists.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={SelectedStation === SimilarArtists.Definition.type}/>
                <StationDescriptor definition={Tag.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={SelectedStation === Tag.Definition.type}/>
            </Row>
            {SelectedStation && <div><SelectedStation appState={this.props.appState}
                                                                                       triggerCreate={this.state.triggerStationCreate}
                                                                                       onStationCreated={id => this.setState({ createdStationId: id })}
                                                                                       onOptionsChanged={x => this.handleOptionsChanged(x)}/>
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

    handleOptionsChanged(isValid) {
        if(this.state.isValid !== isValid) {
            this.setState({ isValid });
        }
    }

    handleSelected(type: Function) {
        this.setState({ selectedStation: type });
    }
}