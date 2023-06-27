import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faPause, faPlay, faPlusSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "react-bootstrap";
import { CustomToggle } from "./CustomToggle";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons/faEllipsisH";
import musicKit from "../../musicKit";

type PlaylistTrackProps = {
    track: MusicKit.MediaItemOptions,
    isCurrent: boolean,
    isPlaying: boolean,
    groupOffset: number,
    index: number,
    onRemove(position: number, count: number),
    onTrackSwitch(position: number): Promise<void>,
    addAlbumToLibrary(item: MusicKit.MediaItemOptions): void,
    addToLibrary(item: MusicKit.MediaItemOptions): void
}

export const PlaylistTrack = React.memo((props: PlaylistTrackProps) =>
    <div className={`playlist-item clearfix ${props.isCurrent ? 'current' : ''}`} style={{
        margin: '0 5px'
    }}>
        <div style={{
            float: 'left',
            padding: '0.5rem 0.7rem',
            cursor: 'pointer'
        }} className={`play-button`}
             onClick={() => props.onTrackSwitch(props.groupOffset + props.index)}>
            <FontAwesomeIcon icon={props.isPlaying ? faPause : faPlay}></FontAwesomeIcon>
        </div>
        <Dropdown align="end" style={{ float: 'right', fontSize: '18px' }}>
            <Dropdown.Toggle as={CustomToggle} id={`item-dropdown-${props.groupOffset + props.index}`}>
                <FontAwesomeIcon style={{ verticalAlign: 'bottom', margin: '.6rem' }} icon={faEllipsisH}></FontAwesomeIcon>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onSelect={() => props.addToLibrary(props.track)} disabled={!musicKit.instance.isAuthorized}>
                            <span style={{ display: 'inline-block', width: '16px', fontSize: '16px', marginRight: '10px' }}>
                                <FontAwesomeIcon icon={faPlusSquare}/>
                            </span>
                    <span>Add song to your AppleMusic Library</span>
                </Dropdown.Item>
                <Dropdown.Item onSelect={() => props.addAlbumToLibrary(props.track)} disabled={!musicKit.instance.isAuthorized}>
                            <span style={{ display: 'inline-block', width: '16px', fontSize: '16px', marginRight: '10px' }}>
                                <FontAwesomeIcon icon={faFolderPlus}/>
                            </span>
                    <span>Add album to your AppleMusic Library</span>
                </Dropdown.Item>
                <Dropdown.Item onSelect={() => props.onRemove(props.groupOffset + props.index, 1)}>
                            <span style={{ display: 'inline-block', width: '16px', fontSize: '16px', marginRight: '10px' }}>
                                <FontAwesomeIcon icon={faTrashAlt}/>
                            </span>
                    <span>Delete from this station</span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
        <div style={{
            lineHeight: '1.1',
            padding: '0.7rem 0 0.7rem 0.7rem'
        }}>{`${props.track.attributes.artistName} - ${props.track.attributes.name}`}</div>
    </div>);