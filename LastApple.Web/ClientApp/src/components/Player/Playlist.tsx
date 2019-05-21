import { Component } from "react";
import * as React from "react";
import { IMediaItem, IMusicKit } from "../MusicKitWrapper/MusicKitDefinitions";

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
            if(groups.current === next.albumInfo) {
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
                    marginBottom: '5px'
                }}>
                    <img style={{
                        height: '60px',
                        width: '60px',
                        verticalAlign: 'top'
                    }} src={group.items[0].artworkURL.replace('{w}x{h}', '60x60')} />
                    <div className={'album-header'} style={{
                        display: 'inline-block',
                        width: 'calc(100% - 60px)',
                        padding: '7px 0 0 10px' }}>
                        <span style={{
                            float: 'right',
                            margin: '5px 8px 0 0',
                            fontSize: '22px',
                            cursor: 'pointer'
                        }} className={'delete-button glyphicon glyphicon-remove'} onClick={() => this.removeItems(group.index, group.items.length)}></span>
                        <h4 style={{ margin: '0' }}>{group.items[0].albumName}</h4>
                        <h5 style={{ margin: '7px 0 0 0', color: '#BBB' }}>{group.items[0].artistName}</h5>
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

    renderTracks(tracks, groupOffset) {
        return tracks.map((item, index) =>
            <div key={index} className={`playlist-item ${item === this.props.currentTrack ? 'current' : ''}`} style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                margin: '0 5px'
            }}>
                <span style={{
                    float: 'left',
                    padding: '8px 10px',
                    cursor: 'pointer'
                }} className={`play-button glyphicon ${ item === this.props.currentTrack && this.props.musicKit.player.isPlaying ? 'glyphicon-pause' : 'glyphicon-play' }`}
                      onClick={() => this.props.onTrackSwitch(item)}></span>
                <span style={{
                    float: 'right',
                    padding: '8px 5px',
                    cursor: 'pointer'
                }} className={'delete-button glyphicon glyphicon-remove'} onClick={() => this.removeItems(groupOffset + index, 1)}></span>
                <h5 style={{
                    marginLeft: '10px'
                }}>{`${item.artistName} - ${item.title}`}</h5>
            </div>);
    }
}