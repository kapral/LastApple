import React, { useState, useEffect, useCallback } from "react";
import { Search } from "../Search";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";
import lastfmApi from "../../restClients/LastfmApi";

export const SimilarArtists: React.FC<IStationParams> = ({ triggerCreate, onStationCreated, onOptionsChanged }) => {
    const [artist, setArtist] = useState<string | null>(null);

    useEffect(() => {
        const createStation = async () => {
            if (triggerCreate) {
                const station = await stationApi.postStation('similarartists', artist);
                onStationCreated(station.id);
            }
        };

        createStation();
    }, [triggerCreate, artist, onStationCreated]);

    const search = useCallback(async (term: string) => {
        const results = await lastfmApi.searchArtist(term);
        return results.map(x => x.name);
    }, []);

    const handleChanged = useCallback((artists: string[]) => {
        const selectedArtist = artists[0];
        setArtist(selectedArtist);
        onOptionsChanged(!!selectedArtist);
    }, [onOptionsChanged]);

    return <div className='station-parameters'>
        <Search<string> search={search}
                                   onChanged={handleChanged}
                                   placeholder={'Placebo...'}/>
    </div>;
};

SimilarArtists.Definition = {
    title: 'Similar Artists',
    description: 'A station containing an artist and similar performers.',
    type: SimilarArtists
};