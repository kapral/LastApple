import React, { Component } from "react";
import { Tag } from "./Stations/Tag";
import { SingleArtist } from "./Stations/SingleArtist";
import { SimilarArtists } from "./Stations/SimilarArtists";
import { Redirect } from "react-router";
import { StationDescriptor } from "./StationDescriptor";
import Container from "react-bootstrap/Container";
import { MyLibrary } from "./Stations/MyLibrary";
import { BaseProps } from "../BaseProps";
import { observer } from "mobx-react";

@observer
export class StationsList extends Component<BaseProps, { triggerStationCreate: boolean, createdStationId: string }> {
    constructor(props) {
        super(props);

        this.state = { triggerStationCreate: false, createdStationId: null };
    }

    render(): React.ReactNode {
        if (this.state.createdStationId) {
            return <Redirect to={`/station/${this.state.createdStationId}`}/>
        }

        return <div className='station-list' style={{ padding: '5px', display: 'grid' }}>
                <StationDescriptor appState={this.props.appState} definition={MyLibrary.Definition} station={MyLibrary} />
                <StationDescriptor appState={this.props.appState} definition={SingleArtist.Definition} station={SingleArtist} />
                <StationDescriptor appState={this.props.appState} definition={SimilarArtists.Definition} station={SimilarArtists} />
                <StationDescriptor appState={this.props.appState} definition={Tag.Definition} station={Tag} />
            </div>;
    }
}