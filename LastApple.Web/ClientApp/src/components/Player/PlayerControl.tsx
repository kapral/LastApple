import * as React from "react";
import musicKit from '../../musicKit';
import { IEvent, IMediaItem, IMusicKit, IStateChangeEvent, PlaybackState } from "../MusicKitWrapper/MusicKitDefinitions";
import * as signalR from "@aspnet/signalr";
import { Playlist, IPagingParams } from "./Playlist";
import { BaseProps } from "../../BaseProps";
import { HubConnection } from "@aspnet/signalr";
import ReactSwitch from "react-switch";
import { observer } from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay, faStepForward } from "@fortawesome/free-solid-svg-icons";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons/faStepBackward";
import { ProgressControl } from "./ProgressControl";

const buttonStyles = {
    background: 'none',
    border: 'none',
    fontSize: '35px',
    outline: 'none',
    margin: '0 25px',
    cursor: 'pointer'
};

interface IPlayerProps extends BaseProps {
    stationId: string;
}

interface IPlayerState {
    currentTrack?: IMediaItem;
    kitInitialized: boolean;
    currentPlaybackTime: number;
    currentPlaybackPercent: number;
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

@observer
export class PlayerControl extends React.Component<IPlayerProps, IPlayerState> {
    musicKit: IMusicKit;
    pendingEvents: Array<IAddTrackEvent> = [];
    station: IStation;
    requestedItems = 0;
    hubConnection: HubConnection;

    private playbackStateSubscription: (x: IEvent) => Promise<void>;

    constructor(props) {
        super(props);

        this.state = {
            kitInitialized: false,
            currentPlaybackTime: 0,
            currentPlaybackPercent: 0
        };
    }

    handlePlaybackTimeChanged(event) {
        const currentPlaybackTime = event.currentPlaybackTime;
        const currentPlaybackDuration = event.currentPlaybackDuration;

        if(event.currentPlaybackDuration === 0 || !Number.isFinite(event.currentPlaybackDuration)) {
            this.setState({ currentPlaybackTime: event.currentPlaybackTime, currentPlaybackPercent: 0 });
        }

        if(currentPlaybackTime === this.state.currentPlaybackTime) {
            const diff = 1 / currentPlaybackDuration / 4 * 100;

            this.setState({ currentPlaybackPercent: this.state.currentPlaybackPercent + diff });

            return;
        }

        const currentPlaybackPercent = currentPlaybackTime / currentPlaybackDuration * 100;
        this.setState({ currentPlaybackTime, currentPlaybackPercent });
    }

    async componentDidMount() {
        this.musicKit = await musicKit.getInstance();

        const stationResponse = await fetch(`api/station/${this.props.stationId}`);
        this.station = await stationResponse.json();

        await this.subscribeToStationEvents();

        this.playbackStateSubscription = async (x: IEvent) => await this.handleStateChange(x as IStateChangeEvent);
        this.musicKit.player.addEventListener('playbackStateDidChange', this.playbackStateSubscription);
        this.musicKit.player.addEventListener('playbackTimeDidChange', x => this.handlePlaybackTimeChanged(x));

        if(this.props.appState.currentKitStationId === this.props.stationId) {
            this.setState({ kitInitialized: true });
            await this.refresh();

            return;
        }

        await this.musicKit.setQueue({});

        const batchItems = (arr, size) =>
            arr.length > size
                ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)]
                : [arr];

        for (let batch of batchItems(this.station.songIds, 300)) {
            if (batch.length) {
                const songs = await this.musicKit.api.songs(batch);
                await this.musicKit.player.queue.append(songs);
            }
        }

        if (this.musicKit.isAuthorized) {
            await this.musicKit.player.play();
        }

        this.setState({ kitInitialized: true });
        this.props.appState.currentKitStationId = this.station.id;
        await this.addTracks(this.pendingEvents);
        this.pendingEvents = [];

        await this.refresh();
    }

    componentWillUnmount() {
        this.hubConnection.off('trackAdded');
        this.musicKit.player.removeEventListener('playbackStateDidChange', this.playbackStateSubscription);
    }

    async subscribeToStationEvents() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/hubs")
            .build();

        await this.hubConnection.start();

        this.hubConnection.on('trackAdded', async (stationId: string, trackId: string, position: number) => {
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

                if (this.musicKit.player.queue.items.length === 1 && this.musicKit.isAuthorized) {
                    await this.musicKit.player.prepareToPlay(this.musicKit.player.queue.items[this.getCurrentQueuePosition()]);
                }

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

        if(!this.isScrobblingEnabled()) {
            return;
        }

        if(event.state === PlaybackState.Ended) {
            await this.scrobble();
        }

        if(event.state === PlaybackState.Playing) {
            await this.setNowPlaying();
        }
    }

    isScrobblingEnabled() {
        return this.props.appState.lastfmAuthenticated && this.props.appState.enableScrobbling;
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

    async switchPrev() {
        this.musicKit.player.stop();
        await this.musicKit.player.skipToPreviousItem();
    }

    async switchNext() {
        this.musicKit.player.stop();
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

        return <div>
            <div className="player-controls" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <div style={{ textAlign: 'center', position: 'relative', padding: '10px', borderBottom: '1px solid #222' }}>
                    {this.renderHeadings()}
                    {this.renderButtons()}
                </div>
            </div>
            <Playlist
                musicKit={this.musicKit}
                currentTrack={this.state.currentTrack}
                pagingParams={this.getPlaylistPaging()}
                showAlbumInfo={!this.station.isContinuous}
                onTrackSwitch={t => this.handleTrackSwitched(t)}
                onRemove={(p, c) => this.handleTracksRemoved(p, c)}
            />
        </div>;
    }

    renderHeadings() {
        if (this.state.currentTrack) {
            return (
                <div style={{
                    padding: '5px 20px',
                    background: '#00000099',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0
                }}>
                    <div style={{
                        float: 'right'
                    }}>
                        <div style={{ marginBottom: '5px' }}>Scrobble</div>
                        <ReactSwitch
                            checked={this.isScrobblingEnabled()}
                            onChange={x => this.handleScrobblingSwitch(x)}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={22}
                            width={44}
                            offColor={'#222'}
                            onColor={'#8e0000'}
                            disabled={!this.props.appState.lastfmAuthenticated}
                        />
                    </div>
                    <h5 style={{ textAlign: 'left', marginTop: '0.7rem' }}>{this.state.currentTrack.title}</h5>
                    <h6 style={{ textAlign: 'left', margin: '0.7rem 0 0.7rem' }}>{`${this.state.currentTrack.artistName} - ${this.state.currentTrack.albumName}`}</h6>
                </div>
            );
        }
        return null;
    }

    static get400x400ImageUrl(sourceUrl: string) {
        return sourceUrl && sourceUrl.replace('{w}x{h}', '400x400')
            .replace('2000x2000', '400x400');
    }

    renderButtons() {
        return <div className={'album-art'} style={{
            textAlign: 'center',
            backgroundImage: `url(${PlayerControl.get400x400ImageUrl(this.state.currentTrack && this.state.currentTrack.artworkURL)})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            display: 'inline-block',
            width: '100%',
            maxWidth: '400px',
            height: '400px'
        }}>
            <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                background: '#00000099',
                padding: '10px',
                lineHeight: 1
            }}>
                <div style={{ marginBottom: '2px' }}>
                    <span style={{ display: 'inline-block', verticalAlign: 'top', marginTop: '2px' }}>{musicKit.formatMediaTime(this.state.currentPlaybackTime)}</span>
                    <div style={{
                        display: 'inline-block',
                        width: 'calc(100% - 100px)',
                        margin: '0 15px'
                    }}>
                    <ProgressControl bufferingPercent={100}
                                     playingPercent={this.state.currentPlaybackPercent}
                                     duration={this.musicKit.player.currentPlaybackDuration}
                                     onPositionChange={t => this.handleSeek(t)}/>
                    </div>
                    <span style={{ display: 'inline-block', verticalAlign: 'top', marginTop: '2px' }}>{musicKit.formatMediaTime(this.musicKit.player.currentPlaybackDuration)}</span>
                </div>
                <span style={buttonStyles} onClick={() => this.switchPrev()}>
                    <FontAwesomeIcon icon={faStepBackward}/>
                </span>
                <span style={buttonStyles} onClick={() => this.handlePlayPause()}>
                    <FontAwesomeIcon icon={this.musicKit.player.isPlaying ? faPause : faPlay}/>
                </span>
                <span style={buttonStyles} onClick={() => this.switchNext()}>
                    <FontAwesomeIcon icon={faStepForward}/>
                </span>
            </div>
        </div>
    }

    async handleSeek(time) {
        this.setState({ currentPlaybackPercent: (time / this.musicKit.player.currentPlaybackDuration) * 100 });
        await this.musicKit.player.seekToTime(time);
    }

    async handlePlayPause() {
        if(this.musicKit.player.isPlaying) {
            await this.musicKit.player.pause();
            return;
        }

        await this.musicKit.player.prepareToPlay(this.musicKit.player.queue.items[this.getCurrentQueuePosition()]);
        await this.musicKit.player.play();
    }

    async handleTrackSwitched(item) {
        if(this.state.currentTrack === item) {
            await this.handlePlayPause();

            return;
        }

        await this.musicKit.player.changeToMediaItem(item);

        this.setState({ currentTrack: item });

        if(this.station.isContinuous) {
            await this.topUp();
        }
    }

    async handleTracksRemoved(position: number, count: number) {
        await fetch(`api/station/${this.station.id}/songs?position=${position}&count=${count}`, { method: 'DELETE' });

        if(this.station.isContinuous) {
            await this.topUp();
        }
    }

    handleScrobblingSwitch(value: boolean) {
        this.props.appState.enableScrobbling = value;
    }
}