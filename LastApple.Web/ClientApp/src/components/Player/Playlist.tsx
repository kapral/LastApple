import * as React from "react";
import { Component } from "react";
import { IMediaItem, IMusicKit } from "../MusicKitWrapper/MusicKitDefinitions";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faPause, faPlay, faPlusSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons/faEllipsisH";
import { CustomToggle } from "./CustomToggle";

export interface IPagingParams {
    offset: number;
    limit: number;
}

interface PlaylistParams {
    musicKit: IMusicKit,
    currentTrack: IMediaItem,
    pagingParams: IPagingParams,
    showAlbumInfo: boolean,
    onRemove(position: number, count: number);
    onTrackSwitch(track: IMediaItem): Promise<void>;
}

export class Playlist extends Component<PlaylistParams, { items: Array<IMediaItem>, currentTrack: IMediaItem }> {
    constructor(props){
        super(props);

        this.state = { items: props.musicKit.player.queue.items, currentTrack: props.currentTrack };
    }

    render() {
        const firstTrackIndex = this.props.pagingParams.offset;
        const lastTrackIndex = firstTrackIndex + this.props.pagingParams.limit;
        const visibleItems = this.state.items.slice(firstTrackIndex, lastTrackIndex);

        return <div className="playlist">
            {this.props.showAlbumInfo ? this.renderGrouped(visibleItems) : this.renderTracks(visibleItems, 0)}
        </div>
    }

    renderGrouped(items) {
        const grouped = items.reduce((groups, next, index) => {
            if (groups.current === next.albumInfo) {
                groups.all[groups.all.length - 1].items.push(next);
            } else {
                groups.current = next.albumInfo;
                groups.all.push({ items: [next], index });
            }
            return groups;
        }, { all: [], current: '' });

        return grouped.all.map((group, index) =>
            <div
                key={index}
                style={{
                    marginBottom: '20px'
                }}>
                <div style={{
                    background: '#00000099',
                    marginBottom: '5px',
                    padding: '.4rem'
                }}>
                    <img style={{
                        height: '60px',
                        width: '60px',
                        verticalAlign: 'top'
                    }} src={group.items[0].artworkURL.replace('{w}x{h}', '60x60')}/>
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
                            <Dropdown.Toggle as={CustomToggle} id={`item-dropdown-group-${index}`}>
                                <FontAwesomeIcon style={{ verticalAlign: 'bottom', margin: '.6rem .5rem' }} icon={faEllipsisH} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onSelect={() => this.addAlbumToLibrary(group.items[0])} disabled={!this.props.musicKit.isAuthorized}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '16px',
                                        fontSize: '16px',
                                        marginRight: '10px'
                                    }}>
                                        <FontAwesomeIcon icon={faFolderPlus}/>
                                    </span>
                                    <span>Add to AppleMusic Library</span>
                                </Dropdown.Item>
                                <Dropdown.Item onSelect={() => this.removeItems(group.index, group.items.length)}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '16px',
                                        fontSize: '16px',
                                        marginRight: '10px'
                                    }}>
                                        <FontAwesomeIcon icon={faTrashAlt}/>
                                    </span>
                                    <span>Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <h5 style={{ margin: '0' }}>{group.items[0].albumName}</h5>
                        <h6 style={{ margin: '.5rem 0 0 0', color: '#BBB' }}>{group.items[0].artistName}</h6>
                    </div>
                </div>
                {this.renderTracks(group.items, group.index)}
            </div>);
    }

    removeItems(position, count) {
        for (let i = 0; i < count; i++) {
            this.props.musicKit.player.queue.remove(position);
        }

        this.setState({ items: this.props.musicKit.player.queue.items });

        this.props.onRemove(position, count);
    }

    async addAlbumToLibrary(item: IMediaItem) {
        const albumId = item.relationships.albums.data[0].id;

        await this.props.musicKit.api.addToLibrary({ albums: [albumId] });
    }

    async addToLibrary(item: IMediaItem) {
        await this.props.musicKit.api.addToLibrary({ songs: [item.id] });
    }

    renderTracks(tracks, groupOffset) {
        return tracks.map((item, index) =>
            <div key={index} className={`playlist-item clearfix ${item === this.props.currentTrack ? 'current' : ''}`} style={{
                margin: '0 5px'
            }}>
                <div style={{
                    float: 'left',
                    padding: '0.5rem 0.7rem',
                    cursor: 'pointer'
                }} className={`play-button`}
                      onClick={() => this.props.onTrackSwitch(item)}>
                    <FontAwesomeIcon icon={item === this.props.currentTrack && this.props.musicKit.player.isPlaying ? faPause : faPlay}></FontAwesomeIcon>
                </div>
                <Dropdown alignRight={true} style={{ float: 'right', fontSize: '18px' }}>
                    <Dropdown.Toggle as={CustomToggle} id={`item-dropdown-${groupOffset + index}`}>
                        <FontAwesomeIcon style={{ verticalAlign: 'bottom', margin: '.6rem' }} icon={faEllipsisH}></FontAwesomeIcon>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onSelect={() => this.addToLibrary(item)} disabled={!this.props.musicKit.isAuthorized}>
                            <span style={{ display: 'inline-block', width: '16px', fontSize: '16px', marginRight: '10px' }}>
                                <FontAwesomeIcon icon={faPlusSquare}/>
                            </span>
                            <span>Add song to AppleMusic Library</span>
                        </Dropdown.Item>
                        <Dropdown.Item onSelect={() => this.addAlbumToLibrary(item)} disabled={!this.props.musicKit.isAuthorized}>
                            <span style={{ display: 'inline-block', width: '16px', fontSize: '16px', marginRight: '10px' }}>
                                <FontAwesomeIcon icon={faFolderPlus}/>
                            </span>
                            <span>Add album to AppleMusic Library</span>
                        </Dropdown.Item>
                        <Dropdown.Item onSelect={() => this.removeItems(groupOffset + index, 1)}>
                            <span style={{ display: 'inline-block', width: '16px', fontSize: '16px', marginRight: '10px' }}>
                                <FontAwesomeIcon icon={faTrashAlt}/>
                            </span>
                            <span>Delete</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <div style={{
                    lineHeight: '1.1',
                    padding: '0.7rem 0 0.7rem 0.7rem'
                }}>{`${item.artistName} - ${item.title}`}</div>
            </div>);
    }
}