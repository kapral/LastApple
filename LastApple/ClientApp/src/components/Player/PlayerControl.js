import * as React from "react";
import { IMusicKit, IMediaItem, IMusicKitStatic } from "../MusicKitWrapper/MusicKit";

declare var MusicKit: IMusicKitStatic;

const secondaryColor = '#250202';

const buttonStyles = {
    background: 'none',
    border: 'none',
    fontSize: '40px',
    outline: 'none',
    margin: '0 20px'
};

const headingStyles = {
    textAlign: 'left',
    paddingLeft: '20px'
};

interface IPlayerState {
    musicKit?: IMusicKit;
    currentTrack?: IMediaItem;
};

export class PlayerControl extends React.Component<{}, IPlayerState> {
    constructor() {
        super();
        this.state = {};
    }

    async componentDidMount() {
        const tokenResponse = await fetch('/auth/token');

        const token = await tokenResponse.json();

        const kit = MusicKit.configure({
            app: {
                name: 'Last Apple',
                build: '0.0.1'
            },
            developerToken: token
        });

        await kit.authorize();
        await kit.setQueue({ album: '14716026' });
        await kit.player.prepareToPlay(kit.player.queue.items[this.getCurrentQueuePosition(kit)]);

        this.refresh();

        kit.player.addEventListener('playbackStateDidChange', () => this.refresh());
    }

    refresh() {
        const musicKit = MusicKit.getInstance();

        const currentTrack = musicKit.player.nowPlayingItem || musicKit.player.queue.items[this.getCurrentQueuePosition(musicKit)] || {};
        this.setState({musicKit, currentTrack});
    }

    getCurrentQueuePosition(musicKit?: IMusicKit) {
        const kit = musicKit || this.state.musicKit;
        const queuePosition = kit.player.queue.position;

        return queuePosition !== -1 ? queuePosition : 0;
    }

    async handlePlayPause() {
        if(this.state.musicKit.player.isPlaying) {
            await this.state.musicKit.player.pause();
            return;
        }

        await this.state.musicKit.player.play();
    }

    async switchPrev() {
        await this.state.musicKit.player.skipToPreviousItem();
    }

    async switchNext() {
        await this.state.musicKit.player.skipToNextItem();
    }

    render() {
        if(!this.state.musicKit) {
            return null;
        }

        return <div style={{ margin: '5px 0' }}>
            <div className="player-controls" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <img style={{ verticalAlign: 'top', width: '200px', height: '200px' }} src={this.state.currentTrack.artworkURL}/>
                <div style={{ textAlign: 'center', display: 'inline-block', width: 'calc(100% - 200px)', height: '200px' }}>
                    {this.renderHeadings()}
                    {this.renderButtons()}
                </div>
            </div>
            {this.renderPlaylist()}
        </div>;
    }

    renderHeadings() {
        if (this.state.currentTrack) {
            return (
                <div style={{marginLeft: '10px', padding: '5px', background: secondaryColor}}>
                    <h4 style={headingStyles}>{this.state.currentTrack.title}</h4>
                    <h5 style={headingStyles}>{`${this.state.currentTrack.artistName} - ${this.state.currentTrack.albumName}`}</h5>
                </div>
            );
        }
        return null;
    }

    renderButtons() {
        return <div style={{marginTop: '45px'}}>
            <button style={buttonStyles} className={'glyphicon glyphicon-step-backward'}
                    onClick={() => this.switchPrev()}></button>
            <button style={buttonStyles} className={this.state.musicKit.player.isPlaying
                ? 'glyphicon glyphicon-pause'
                : 'glyphicon glyphicon-play'} onClick={() => this.handlePlayPause()}></button>
            <button style={buttonStyles} className={'glyphicon glyphicon-step-forward'}
                    onClick={() => this.switchNext()}></button>
        </div>
    }

    renderPlaylist() {
        return <div className="playlist" style={{marginTop: '15px'}}>
            {this.state.musicKit.player.queue.items.map((item, index) =>
                <div key={index} style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    background: this.getCurrentQueuePosition() === index ? secondaryColor : 'none'
                }}>
                    <h5 style={{display: 'inline-block', marginLeft: '10px'}}>{item.title}</h5>
                </div>)}
        </div>
    }
}