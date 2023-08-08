import React from "react";
import { StationPlayer } from "./Player/StationPlayer";
import {useAppContext} from '../AppContext';
import {useAppleUnauthenticatedWarning} from "../hooks/useAppleUnauthenticatedWarning";

interface INowPlayingProps {
    readonly showPlayer: boolean;
    readonly stationId: string;
}

export const NowPlaying: React.FunctionComponent<INowPlayingProps> = (props: INowPlayingProps) => {
    const appContext = useAppContext();
    const appleUnauthenticatedWarning = useAppleUnauthenticatedWarning();

    React.useEffect(
        () => {
            if (!!props.stationId && props.stationId !== appContext.latestStationId) {
                appContext.setLatestStationId(props.stationId);
            }
        },
        [appContext, props.stationId]
    );

    return (
        <div style={{ display: props.showPlayer ? 'block' : 'none' }}>
            {appleUnauthenticatedWarning.isShown && appleUnauthenticatedWarning.Element}
            <StationPlayer stationId={props.stationId} />
        </div>
    );
};