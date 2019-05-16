import { Component } from "react";
import * as React from "react";
import { IMediaItem, IMusicKit } from "../MusicKitWrapper/MusicKitDefinitions";

export interface IPagingParams {
    offset: number;
    limit: number;
}

export class Playlist extends Component<{musicKit: IMusicKit, currentTrack: IMediaItem, pagingParams: IPagingParams, showAlbumInfo: boolean }> {
    render() {
        const firstTrackIndex = this.props.pagingParams.offset;
        const lastTrackIndex = firstTrackIndex + this.props.pagingParams.limit;
        const visibleItems = this.props.musicKit.player.queue.items.slice(firstTrackIndex, lastTrackIndex);

        return <div className="playlist" style={{ marginTop: '15px' }}>
            {this.props.showAlbumInfo ? this.renderGrouped(visibleItems) : this.renderTracks(visibleItems)}
        </div>
    }

    renderGrouped(items) {
        const grouped = items.reduce((groups, next) => {
            if(groups.current === next.albumInfo) {
                groups.all[groups.all.length - 1].push(next);
            } else {
                groups.current = next.albumInfo;
                groups.all.push([next]);
            }
            return groups;
        }, { all: [], current: '' });

        return grouped.all.map((group, index) =>
            <div
                key={index}
                style={{
                    margin: '5px 0 15px'
                }}>
                <div style={{
                    background: '#00000099',
                    marginBottom: '5px'
                }}>
                    <img style={{
                        height: '60px',
                        width: '60px',
                        verticalAlign: 'top'
                    }} src={group[0].artworkURL.replace('{w}x{h}', '60x60')} />
                    <div style={{ display: 'inline-block', padding: '7px 0 0 10px' }}>
                        <h4 style={{ margin: '0' }}>{group[0].albumName}</h4>
                        <h5 style={{ margin: '7px 0 0 0', color: '#BBB' }}>{group[0].artistName}</h5>
                    </div>
                </div>
                {this.renderTracks(group)}
            </div>);
    }

    renderTracks(tracks) {
        return tracks.map((item, index) =>
            <div key={index} style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                background: item === this.props.currentTrack ? '#E0E0E0' : 'none',
                color: item === this.props.currentTrack ? '#000' : 'inherit',
            }}>
                <h5 style={{
                    display: 'inline-block',
                    marginLeft: '10px'
                }}>{`${item.artistName} - ${item.title}`}</h5>
            </div>);
    }
}