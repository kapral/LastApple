import React, { Component } from "react";
import { Tag } from "./Stations/Tag";
import { SingleArtist } from "./Stations/SingleArtist";
import { SimilarArtists } from "./Stations/SimilarArtists";
import { Redirect } from "react-router";
import { StationDescriptor } from "./StationDescriptor";
import { MyLibrary } from "./Stations/MyLibrary";

export class StationsList extends Component<{}, { triggerStationCreate: boolean, createdStationId: string }> {
    constructor(props) {
        super(props);

        this.state = { triggerStationCreate: false, createdStationId: null };
    }

    render(): React.ReactNode {
        if (this.state.createdStationId) {
            return <Redirect to={`/station/${this.state.createdStationId}`}/>
        }

        return <div className='station-list' style={{ padding: '5px', display: 'grid' }}>
                <StationDescriptor definition={MyLibrary.Definition} StationComponent={MyLibrary} />
                <StationDescriptor definition={SingleArtist.Definition} StationComponent={SingleArtist} />
                <StationDescriptor definition={SimilarArtists.Definition} StationComponent={SimilarArtists} />
                <StationDescriptor definition={Tag.Definition} StationComponent={Tag} />
            </div>;
    }
}