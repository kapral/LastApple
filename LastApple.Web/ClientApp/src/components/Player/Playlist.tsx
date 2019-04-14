import { Component } from "react";
import * as React from "react";
import { IMediaItem, IMusicKit } from "../MusicKitWrapper/MusicKitDefinitions";

const secondaryColor = '#250202';

export class Playlist extends Component<{musicKit: IMusicKit, currentTrack: IMediaItem}> {
    render() {
        return <div className="playlist" style={{marginTop: '15px'}}>
            {this.props.musicKit.player.queue.items.map((item, index) =>
                <div key={index} style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    background: item === this.props.currentTrack ? secondaryColor : 'none'
                }}>
                    <h5 style={{display: 'inline-block', marginLeft: '10px'}}>{item.title}</h5>
                </div>)}
        </div>
    }
}