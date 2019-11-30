import * as React from "react";
import { Dropdown } from "react-bootstrap";
import { CustomToggle } from "./CustomToggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons/faEllipsisH";
import musicKit from "../../musicKit";
import { faFolderPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { IMediaItemOptions } from "../MusicKitWrapper/MusicKitDefinitions";

type PlaylistTrackGroupProps = {
    currentTrack: IMediaItemOptions,
    tracks: IMediaItemOptions[],
    isPlaying: boolean,
    index: number,
    onRemove(position: number, count: number),
    addAlbumToLibrary(item: IMediaItemOptions): void,
}

export const PlaylistTrackGroup = React.memo((props: React.PropsWithChildren<PlaylistTrackGroupProps>) => 
    <div style={{ marginBottom: '20px' }}>
        <div style={{
            background: '#00000099',
            marginBottom: '5px',
            padding: '.4rem'
        }}>
            <img style={{
                height: '60px',
                width: '60px',
                verticalAlign: 'top'
            }} alt={'album logo'} src={props.tracks[0].attributes.artwork.url.replace('{w}x{h}', '60x60')}/>
            <div className={'album-header'} style={{
                display: 'inline-block',
                width: 'calc(100% - 60px)',
                padding: '7px 0 0 10px'
            }}>
                <Dropdown alignRight={true} style={{
                    float: 'right',
                    margin: '5px 0',
                    fontSize: '22px'
                }}>
                    <Dropdown.Toggle as={CustomToggle} id={`item-dropdown-group-${props.index}`}>
                        <FontAwesomeIcon style={{ verticalAlign: 'bottom', margin: '.6rem .5rem' }} icon={faEllipsisH} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onSelect={() => props.addAlbumToLibrary(props.tracks[0])} disabled={!musicKit.instance.isAuthorized}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '16px',
                                            fontSize: '16px',
                                            marginRight: '10px'
                                        }}>
                                            <FontAwesomeIcon icon={faFolderPlus}/>
                                        </span>
                            <span>Add to your AppleMusic Library</span>
                        </Dropdown.Item>
                        <Dropdown.Item onSelect={() => props.onRemove(props.index, props.tracks.length)}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '16px',
                                            fontSize: '16px',
                                            marginRight: '10px'
                                        }}>
                                            <FontAwesomeIcon icon={faTrashAlt}/>
                                        </span>
                            <span>Delete from this station</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <h5 style={{ margin: '0' }}>{props.tracks[0].attributes.albumName}</h5>
                <h6 style={{ margin: '.5rem 0 0 0', color: '#BBB' }}>{props.tracks[0].attributes.artistName}</h6>
            </div>
        </div>
        {props.children}
    </div>);