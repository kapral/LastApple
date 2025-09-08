import React, { useContext, useEffect } from "react";
import { IStationParams } from "../IStationParams";
import stationApi from "../../restClients/StationApi";
import { LastfmContext } from '../../lastfm/LastfmContext';
import { AuthenticationState } from '../../authentication';

export const MyLibrary: React.FC<IStationParams> = ({ triggerCreate, onStationCreated, onOptionsChanged }) => {
    const context = useContext(LastfmContext);

    useEffect(() => {
        onOptionsChanged(context.authentication.state === AuthenticationState.Authenticated);
    }, [context.authentication.state, onOptionsChanged]);

    useEffect(() => {
        const createStation = async () => {
            if (triggerCreate) {
                const station = await stationApi.postStation('lastfmlibrary', 'my');
                onStationCreated(station.id);
            }
        };

        createStation();
    }, [triggerCreate, onStationCreated]);

    const showWarning = context.authentication.state === AuthenticationState.Unauthenticated;
    
    return <div className='station-parameters' style={{ display: 'flex', flex: 1 }}>
        <div style={{ margin: '10px 10px 10px 0', color: '#ffc123', display: showWarning ? 'block' : 'none' }}>Log in to last.fm to listen to your library.</div>
        <div style={{ flex: 1, height: '54px' }}></div>
    </div>;
};

MyLibrary.Definition = {
    title: 'My last.fm Library',
    description: 'A continuous station based on your last.fm library.',
    type: MyLibrary
};