import * as React from "react";
import musicKit from '../../musicKit';
import { IEvent, IMediaItem, IMusicKit, IStateChangeEvent, PlaybackState } from "../MusicKitWrapper/MusicKitDefinitions";
import * as signalR from "@aspnet/signalr";
import { Playlist, IPagingParams } from "./Playlist";

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

interface IStationDefinition {
    stationType: string;
}

interface IStation {
    id: string;
    songIds: Array<string>
    size: number;
    isContinuous: boolean;
    definition: IStationDefinition;
}

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

export class PlayerControl extends React.Component<IPlayerProps, IPlayerState> {
    musicKit: IMusicKit;
    pendingEvents: Array<IAddTrackEvent> = [];
    station: IStation;
    requestedItems = 0;

    constructor(props) {
        super(props);
        this.state = {kitInitialized: false};
    }

    async componentDidMount() {
        await this.subscribeToStationEvents();

        this.musicKit = await musicKit.getInstance();

        this.musicKit.player.addEventListener('playbackStateDidChange', async (x: IEvent) => await this.handleStateChange(x as IStateChangeEvent));

        const stationResponse = await fetch(`api/station/${this.props.stationId}`);
        this.station = await stationResponse.json();

        await this.musicKit.setQueue({ songs: this.station.songIds });
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

            if(this.requestedItems > 0) {
                this.requestedItems--;
            }

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

        if(this.station.isContinuous) {
            await this.topUp();
        }

        if(event.state === PlaybackState.Ended) {
            await this.scrobble();
            await this.musicKit.authorize();
        }

        if(event.state === PlaybackState.Playing) {
            await this.setNowPlaying();
        }
    }

    async topUp() {
        const itemsLeft = this.musicKit.player.queue.items.length - this.getCurrentQueuePosition() + this.requestedItems;
        const itemsToAdd = this.station.size - itemsLeft;

        if(itemsToAdd > 0) {
            this.requestedItems += itemsToAdd;
            await fetch(`api/station/${this.station.definition.stationType}/${this.props.stationId}/topup/${itemsToAdd}`, { method: 'POST' });
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

    getPlaylistPaging(): IPagingParams {
        if(this.station.isContinuous) {
            return {
                offset: this.getCurrentQueuePosition(),
                limit: 10
            };
        }

        return {
            offset: 0,
            limit: 1000
        };
    }

    render() {
        if(!this.state.kitInitialized) {
            return null;
        }

        return <div style={{ margin: '5px 0' }}>
            <div className="player-controls" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    {this.renderHeadings()}
                    {this.renderButtons()}
                </div>
            </div>
            <Playlist musicKit={this.musicKit} currentTrack={this.state.currentTrack} pagingParams={this.getPlaylistPaging()} showAlbumInfo={!this.station.isContinuous} />
        </div>;
    }

    renderHeadings() {
        if (this.state.currentTrack) {
            return (
                <div style={{
                    padding: '5px',
                    background: '#00000099',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0
                }}>
                    <h4 style={headingStyles}>{this.state.currentTrack.title}</h4>
                    <h5 style={headingStyles}>{`${this.state.currentTrack.artistName} - ${this.state.currentTrack.albumName}`}</h5>
                </div>
            );
        }
        return null;
    }

    renderButtons() {
        return <div className={'album-art'} style={{
            textAlign: 'center',
            backgroundImage: `url(${this.state.currentTrack && this.state.currentTrack.artworkURL})`,
            backgroundPosition: 'center',
            height: '400px',
            backgroundSize: 'cover',
            padding: '300px 0 0',
            display: 'inline-block'
        }}>
            <div style={{
                display: 'inline-block',
                width: '300px',
                borderRadius: '30px',
                background: '#00000099',
                padding: '5px'
            }}>
                <span style={buttonStyles} className={'glyphicon glyphicon-step-backward'}
                        onClick={() => this.switchPrev()}></span>
                <span style={buttonStyles} className={this.musicKit.player.isPlaying
                    ? 'glyphicon glyphicon-pause'
                    : 'glyphicon glyphicon-play'} onClick={() => this.handlePlayPause()}></span>
                <span style={buttonStyles} className={'glyphicon glyphicon-step-forward'}
                        onClick={() => this.switchNext()}></span>
            </div>
        </div>
    }
}