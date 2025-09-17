import React, { useState, useEffect, useCallback } from "react";
import { Search } from "../Search";
import musicKit from "../../musicKit";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";

export const SingleArtist: React.FC<IStationParams> & { Definition: any } = ({ triggerCreate, onStationCreated, onOptionsChanged }) => {
    const [currentArtistIds, setCurrentArtistIds] = useState<string[]>([]);

    useEffect(() => {
        const createStation = async () => {
            if (triggerCreate) {
                const station = await stationApi.postStation('artist', currentArtistIds.join(','));
                onStationCreated(station.id);
            }
        };

        createStation();
    }, [triggerCreate, currentArtistIds, onStationCreated]);

    const search = useCallback(async (term: string) => {
        const kit = await musicKit.getInstance();
        const parameters = { term: term, types: ['artists'], l: 'en-us' };

        const response = await kit.api.music(`/v1/catalog/${kit.storefrontId}/search`, parameters);

        if (!response.data.results.artists) {
            return [];
        }

        return response.data.results.artists.data.map(x => x);
    }, []);

    const handleChanged = useCallback((artists: MusicKit.MediaItem[]) => {
        setCurrentArtistIds(artists.map(x => x.id));
        onOptionsChanged(!!artists.length);
    }, [onOptionsChanged]);

    return <div className='station-parameters'>
        <Search<MusicKit.MediaItem> search={search}
                                   onChanged={handleChanged}
                                   placeholder={'Radiohead...'}
                                   labelAccessor={x => (x as any).attributes.name}/>
    </div>
};

SingleArtist.Definition = {
    title: 'Artist',
    description: 'Play all tracks of one artist.',
    type: SingleArtist
};