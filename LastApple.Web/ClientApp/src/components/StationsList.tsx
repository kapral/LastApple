import React, { Component } from "react";
import { Tag } from "./Stations/Tag";
import { SingleArtist } from "./Stations/SingleArtist";
import { SimilarArtists } from "./Stations/SimilarArtists";
import { Redirect } from "react-router";
import { StationDescriptor } from "./StationDescriptor";

export class StationsList extends Component<{}, {selectedStation: Function, submit: boolean, createdStationId: string}> {
    constructor(props) {
        super(props);

        this.state = { selectedStation: null, submit: false, createdStationId: null };
    }

    render(): React.ReactNode {
        if (this.state.createdStationId) {
            return <Redirect to={`/station/${this.state.createdStationId}`}/>
        }

        const SelectedStation = this.state.selectedStation;

        return <div>
            <div className={'clearfix'}>
                <StationDescriptor definition={SingleArtist.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={this.state.selectedStation === SingleArtist.Definition.type}/>
                <StationDescriptor definition={SimilarArtists.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={this.state.selectedStation === SimilarArtists.Definition.type}/>
                <StationDescriptor definition={Tag.Definition}
                                   onSelected={s => this.handleSelected(s)}
                                   selected={this.state.selectedStation === Tag.Definition.type}/>
            </div>
            {SelectedStation && <div><SelectedStation submit={this.state.submit}
                                                      onCreated={id => this.setState({ createdStationId: id })}/>
                <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
                    <button style={{
                        margin: '10px auto',
                        background: '#100404',
                        border: 'none',
                        padding: '10px',
                        color: '#C8C8C8'
                    }} onClick={() => this.setState({ submit: true })}>Play Station
                    </button>
                </div>
            </div>}
        </div>;
    }

    handleSelected(type: Function) {
        this.setState({ selectedStation: type });
    }
}