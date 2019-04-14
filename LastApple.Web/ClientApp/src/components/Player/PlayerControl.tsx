import * as React from "react";
import musicKit from '../../musicKit';
import { IEvent, IMediaItem, IMusicKit, IStateChangeEvent, PlaybackState } from "../MusicKitWrapper/MusicKitDefinitions";
import * as signalR from "@aspnet/signalr";
import { Playlist } from "./Playlist";

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
    stationId: string;
}

interface IPlayerState {
    currentTrack?: IMediaItem;
    kitInitialized: boolean;
}

interface IStation {
    id: string;
    songIds: Array<string>;
}

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

export class PlayerControl extends React.Component<IPlayerProps, IPlayerState> {
    musicKit: IMusicKit;
    pendingEvents: Array<IAddTrackEvent> = [];

    constructor(props) {
        super(props);
        this.state = {kitInitialized: false};
    }

    async componentDidMount() {
        await this.subscribeToStationEvents();

        this.musicKit = await musicKit.getInstance();

        this.musicKit.player.addEventListener('playbackStateDidChange', async (x: IEvent) => await this.handleStateChange(x as IStateChangeEvent));

        const stationResponse = await fetch(`api/station/${this.props.stationId}`);
        const station: IStation = await stationResponse.json();

        await this.musicKit.setQueue({ songs: station.songIds });
        await this.musicKit.player.prepareToPlay(this.musicKit.player.queue.items[this.getCurrentQueuePosition()]);

        this.setState({ kitInitialized: true });
        await this.addTracks(this.pendingEvents);
        this.pendingEvents = [];

        await this.refresh();
    }

    async subscribeToStationEvents() {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/hubs")
            .build();

        await connection.start();

        connection.on('trackAdded', async (stationId: string, trackId: string, position: number) => {
            if(stationId !== this.props.stationId) {
                return;
            }

            const event = { trackId, position };

            if(!this.state.kitInitialized) {
                this.pendingEvents.push(event);
                return;
            }

            await this.addTracks([event]);
            await this.refresh();
        });
    }

    async addTracks(addTrackEvents: Array<IAddTrackEvent>) {
        for (let event of addTrackEvents) {
            let existingItem = this.musicKit.player.queue.item(event.position);

            if(!existingItem) {
                const song = await this.musicKit.api.song(event.trackId);

                this.musicKit.player.queue.append(song);
                return;
            }

            if(existingItem.id === event.trackId) {
                return;
            }

            console.warn(`Position ${event.position} already occupied by a different item.`);
        }
    }

    async handleStateChange(event: IStateChangeEvent) {
        if(!event) {
            return;
        }

        await this.refresh();

        if(event.state === PlaybackState.Ended) {
            await this.scrobble();
        }

        if(event.state === PlaybackState.Playing) {
            await this.setNowPlaying();
        }
    }

    async refresh() {
        const kit = await musicKit.getInstance();

        const currentTrack = kit.player.nowPlayingItem || kit.player.queue.items[this.getCurrentQueuePosition()];
        this.setState({currentTrack});
    }

    getCurrentQueuePosition() {
        const queuePosition = this.musicKit.player.queue.position;

        return queuePosition !== -1 ? queuePosition : 0;
    }

    async scrobble() {
        await this.sendToLastfm('scrobble');
    }

    async setNowPlaying() {
        await this.sendToLastfm('nowplaying');
    }

    async sendToLastfm(method: string) {
        const currentTrack = {
            artist: this.state.currentTrack.artistName,
            track: this.state.currentTrack.title
        };

        const url = `api/lastfm/${method}?artist=${this.state.currentTrack.artistName}&song=${this.state.currentTrack.title}`;

        await fetch(url.toString(), { method: 'POST', body: JSON.stringify(currentTrack) });
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
        if(!this.state.kitInitialized) {
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
            <Playlist musicKit={this.musicKit} currentTrack={this.state.currentTrack} visibleOffset={this.getCurrentQueuePosition()} visibleCount={10}/>
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
}