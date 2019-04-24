import { Component } from "react";
import * as React from "react";
import { IMediaItem, IMusicKit } from "../MusicKitWrapper/MusicKitDefinitions";

const secondaryColor = '#250202';

export class Playlist extends Component<{musicKit: IMusicKit, currentTrack: IMediaItem, visibleOffset: number, visibleCount: number}> {
    render() {
        const visibleItems = this.props.musicKit.player.queue.items.slice(this.props.visibleOffset, this.props.visibleOffset + this.props.visibleCount);

        return <div className="playlist" style={{marginTop: '15px'}}>
            {visibleItems.map((item, index) =>
                <div key={index} style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    background: item === this.props.currentTrack ? secondaryColor : 'none'
                }}>
                    <h5 style={{display: 'inline-block', marginLeft: '10px'}}>{`${item.artistName} - ${item.title}`}</h5>
                </div>)}
        </div>
    }
}