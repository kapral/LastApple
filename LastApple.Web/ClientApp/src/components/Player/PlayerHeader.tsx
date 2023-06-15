import ReactSwitch from "react-switch";
import * as React from "react";
import MediaItemOptions = MusicKit.MediaItemOptions;

export type PlayerHeaderProps = { currentTrack: MediaItemOptions, isScrobblingEnabled: boolean, onScrobblingSwitch(enabled: boolean): void, lastfmAuthenticated: boolean };

export const PlayerHeader = (props: PlayerHeaderProps) =>
    <div style={{
        padding: '5px 20px',
        background: '#00000099',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0
    }}>
        <div style={{
            float: 'right'
        }}>
            <div style={{ marginBottom: '5px' }}>Scrobble</div>
            <ReactSwitch
                checked={props.isScrobblingEnabled}
                onChange={x => props.onScrobblingSwitch(x)}
                uncheckedIcon={false}
                checkedIcon={false}
                height={22}
                width={44}
                offColor={'#222'}
                onColor={'#8e0000'}
                disabled={!props.lastfmAuthenticated}
            />
        </div>
        <h5 style={{
            textAlign: 'left',
            marginTop: '0.7rem'
        }}>{props.currentTrack.attributes.name}</h5>
        <h6 style={{
            textAlign: 'left',
            margin: '0.7rem 0 0.7rem'
        }}>{`${props.currentTrack.attributes.artistName} - ${props.currentTrack.attributes.albumName}`}</h6>
    </div>;