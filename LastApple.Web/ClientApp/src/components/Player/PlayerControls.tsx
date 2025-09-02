import { ProgressControl } from "./ProgressControl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons/faStepBackward";
import { faPause, faPlay, faStepForward } from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import { StationPlayer } from "./StationPlayer";
import { PlayerHeader, PlayerHeaderProps } from "./PlayerHeader";

const containerStyles: React.CSSProperties = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};

const controlsContainerStyles: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    background: '#00000099',
    padding: '10px',
    lineHeight: 1
};

const albumArtStyles: React.CSSProperties = {
    textAlign: 'center',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    display: 'inline-block',
    width: '100%',
    maxWidth: '400px',
    height: '400px'
};

const artContainerStyles: React.CSSProperties = {
    textAlign: 'center',
    position: 'relative',
    padding: '10px',
    borderBottom: '1px solid #222'
};

const buttonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '35px',
    outline: 'none',
    margin: '0 25px',
    cursor: 'pointer'
};

type PlayerControlsProps = { currentTrack: MusicKit.MediaItem, isPlaying: boolean, switchPrev(): void, switchNext(): void, onPlayPause(): void } & PlayerHeaderProps;

export const PlayerControls = (props: PlayerControlsProps) =>
    <div className="player-controls" style={containerStyles}>
        <div style={artContainerStyles}>
            {props.currentTrack && <PlayerHeader
                currentTrack={props.currentTrack}
                isScrobblingEnabled={props.isScrobblingEnabled}
                onScrobblingSwitch={props.onScrobblingSwitch}
                lastfmAuthenticated={props.lastfmAuthenticated}
            />}
            <div className={'album-art'} style={{
                backgroundImage: `url(${StationPlayer.getImageUrl(props.currentTrack?.attributes?.artwork?.url)})`,
                ...albumArtStyles
            }}>
                <div style={controlsContainerStyles}>
                    <div style={{ marginBottom: '2px' }}>
                        <ProgressControl />
                    </div>
                    <span style={buttonStyles} onClick={() => props.switchPrev()}>
                        <FontAwesomeIcon icon={faStepBackward}/>
                     </span>
                    <span style={buttonStyles} onClick={() => props.onPlayPause()}>
                        <FontAwesomeIcon icon={props.isPlaying ? faPause : faPlay} />
                    </span>
                    <span style={buttonStyles} onClick={() => props.switchNext()}>
                        <FontAwesomeIcon icon={faStepForward}/>
                    </span>
                </div>
            </div>
        </div>
    </div>;