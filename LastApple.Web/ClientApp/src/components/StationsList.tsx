import React, { useState } from "react";
import { Tag } from "./Stations/Tag";
import { SingleArtist } from "./Stations/SingleArtist";
import { SimilarArtists } from "./Stations/SimilarArtists";
import { Redirect } from "react-router";
import { StationDescriptor } from "./StationDescriptor";
import { MyLibrary } from "./Stations/MyLibrary";

export const StationsList: React.FC = () => {
    const [createdStationId, setCreatedStationId] = useState<string | null>(null);

    if (createdStationId) {
        return <Redirect to={`/station/${createdStationId}`}/>
    }

    return <div className='station-list' style={{ padding: '5px', display: 'grid' }}>
            <StationDescriptor definition={MyLibrary.Definition} StationComponent={MyLibrary} />
            <StationDescriptor definition={SingleArtist.Definition} StationComponent={SingleArtist} />
            <StationDescriptor definition={SimilarArtists.Definition} StationComponent={SimilarArtists} />
            <StationDescriptor definition={Tag.Definition} StationComponent={Tag} />
        </div>;
};