import * as React from "react";
import musicKit, { IMusicKit, IMediaItem, IMusicKitStatic } from "../MusicKitWrapper/MusicKit";

const secondaryColor = '#250202';

const buttonStyles = {
    background: 'none',
    border: 'none',
    fontSize: '40px',
    outline: 'none',
    margin: '0 20px'
};

const headingStyles: React.CSSProperties = {
    textAlign: 'left',
    paddingLeft: '20px'
};

interface IPlayerProps {
    artistId: string;
}

interface IPlayerState {
    currentTrack?: IMediaItem;
    currentArtistId?: string;
    kitInitialized: boolean;
}

export class PlayerControl extends React.Component<IPlayerProps, IPlayerState> {
    musicKit: IMusicKit;

    constructor(props) {
        super(props);
        this.state = {kitInitialized: false};
    }

    async componentDidMount() {
        const tokenResponse = await fetch('/auth/token');

        const token = await tokenResponse.json();

        this.musicKit = musicKit.configure({
            app: {
                name: 'Last Apple',
                build: '0.0.1'
            },
            developerToken: token
        });

        await this.musicKit.authorize();

        this.musicKit.player.addEventListener('playbackStateDidChange', () => this.refresh());
    }

    async componentDidUpdate() {
        if(this.props.artistId === this.state.currentArtistId) {
            return;
        }

        const songsResponse = await fetch(`songs/${this.props.artistId}`);
        const songs = await songsResponse.json();

        await this.musicKit.setQueue({ songs });
        await this.musicKit.player.prepareToPlay(this.musicKit.player.queue.items[this.getCurrentQueuePosition()]);

        this.setState({kitInitialized: true, currentArtistId: this.props.artistId});

        this.refresh();
    }

    refresh() {
        const kit = musicKit.getInstance();

        const currentTrack = kit.player.nowPlayingItem || kit.player.queue.items[this.getCurrentQueuePosition()];
        this.setState({currentTrack});
    }

    getCurrentQueuePosition() {
        const queuePosition = this.musicKit.player.queue.position;

        return queuePosition !== -1 ? queuePosition : 0;
    }

    async handlePlayPause() {
        if(this.musicKit.player.isPlaying) {
            await this.musicKit.player.pause();
            return;
        }

        await this.musicKit.player.play();
    }

    async switchPrev() {
        await this.musicKit.player.skipToPreviousItem();
    }

    async switchNext() {
        await this.musicKit.player.skipToNextItem();
    }

    render() {
        if(!this.state.kitInitialized || !this.props.artistId) {
            return null;
        }

        return <div style={{ margin: '5px 0' }}>
            <div className="player-controls" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <img style={{ verticalAlign: 'top', width: '200px', height: '200px' }} src={this.state.currentTrack && this.state.currentTrack.artworkURL}/>
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
            <button style={buttonStyles} className={this.musicKit.player.isPlaying
                ? 'glyphicon glyphicon-pause'
                : 'glyphicon glyphicon-play'} onClick={() => this.handlePlayPause()}></button>
            <button style={buttonStyles} className={'glyphicon glyphicon-step-forward'}
                    onClick={() => this.switchNext()}></button>
        </div>
    }

    renderPlaylist() {
        return <div className="playlist" style={{marginTop: '15px'}}>
            {this.musicKit.player.queue.items.map((item, index) =>
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