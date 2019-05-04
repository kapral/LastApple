import { Component } from "react";
import * as React from "react";
import { IMediaItem, IMusicKit } from "../MusicKitWrapper/MusicKitDefinitions";

const secondaryColor = '#250202';

export interface IPagingParams {
    offset: number;
    limit: number;
}

export class Playlist extends Component<{musicKit: IMusicKit, currentTrack: IMediaItem, pagingParams: IPagingParams}> {
    render() {
        const firstTrackIndex = this.props.pagingParams.offset;
        const lastTrackIndex = firstTrackIndex + this.props.pagingParams.limit;
        const visibleItems = this.props.musicKit.player.queue.items.slice(firstTrackIndex, lastTrackIndex);

        return <div className="playlist" style={{ marginTop: '15px' }}>
            {visibleItems.map((item, index) =>
                <div key={index} style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    background: item === this.props.currentTrack ? secondaryColor : 'none'
                }}>
                    <h5 style={{ display: 'inline-block', marginLeft: '10px' }}>{`${item.artistName} - ${item.title}`}</h5>
                </div>)}
        </div>
    }
}