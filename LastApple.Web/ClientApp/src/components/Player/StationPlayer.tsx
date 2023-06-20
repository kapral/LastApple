import * as React from 'react';
import musicKit from '../../musicKit';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { Playlist } from './Playlist';
import { BaseProps } from '../../BaseProps';
import { observer } from 'mobx-react';
import lastfmApi from '../../restClients/LastfmApi';
import stationApi, { IStation } from '../../restClients/StationApi'
import environment from '../../Environment';
import { PlayerControls } from './PlayerControls';
import { Spinner } from 'react-bootstrap';
import { playbackEventMediator } from '../../PlaybackEventMediator';
import { instance as mediaSessionManager } from '../../MediaSessionManager'
import { PlaybackStates } from '../../musicKitEnums';

interface IPlayerProps extends BaseProps {
    stationId: string;
}

interface IPlayerState {
    currentTrack?: MusicKit.MediaItemOptions;
    tracks: Array<MusicKit.MediaItemOptions>;
    suppressEvents: boolean;
    isPlaying: boolean;
}

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

@observer
export class StationPlayer extends React.Component<IPlayerProps, IPlayerState> {
    musicKit: MusicKit.MusicKitInstance;
    pendingEvents: Array<IAddTrackEvent> = [];
    station: IStation;
    requestedItems = 0;
    hubConnection: HubConnection;

    private playbackStateSubscription: (x: MusicKit.Events['playbackStateDidChange']) => Promise<void>;

    constructor(props) {
        super(props);

        this.state = {
            tracks: [],
            suppressEvents: false,
            isPlaying: false
        };
    }

    async init() {
        if (!this.props.stationId)
            return;

        if (this.station && this.station.id === this.props.stationId) {
            return;
        }

        this.station = null;
        this.pendingEvents = [];

        if (!this.state.suppressEvents)
            this.setState({ suppressEvents: true });

        if (this.state.tracks.length)
            this.setState({ currentTrack: null, tracks: [] });

        if (this.musicKit) {
            await this.musicKit.stop();
            await this.musicKit.setQueue({});
        } else {
            this.musicKit = await musicKit.getInstance();

            await this.subscribeToStationEvents();

            this.playbackStateSubscription = async (x: MusicKit.Events['playbackStateDidChange']) => await this.handleStateChange(x);
            this.musicKit.addEventListener('playbackStateDidChange', this.playbackStateSubscription);
            this.musicKit.addEventListener('mediaItemDidChange', (event: any) => {
                document.title = `${event.item.title} - ${event.item.artistName}`;

                mediaSessionManager.updateSessionMetadata(event.item.artworkURL);
            });

            mediaSessionManager.setNextHandler(() => this.switchNext());
            mediaSessionManager.setPrevHandler(() => this.switchPrev());
        }

        this.station = await stationApi.getStation(this.props.stationId);

        const batchItems = (arr, size) =>
            arr.length > size
                ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)]
                : [arr];

        for (let batch of batchItems(this.station.songIds, 300)) {
            if (batch.length) {
                const songs = await this.musicKit.api.songs(batch);
                await this.appendTracksToQueue(songs);
            }
        }

        this.setState({ suppressEvents: false });
        // @ts-ignore
        if (this.musicKit.queue.items.length) {
            await this.play();
        }

        await this.addTracks(this.pendingEvents);
        this.pendingEvents = [];
    }

    async play() {
        await this.musicKit.play()
        playbackEventMediator.notifyPlayStart();
    }

    async appendTracksToQueue(tracks: MusicKit.Songs[]) {
        const currentTracks = this.state.tracks.concat(tracks);

        // @ts-ignore
        await this.musicKit.queue.append(tracks);
        this.setState({ tracks: currentTracks });
    }

    async componentDidUpdate(prevProps: IPlayerProps) {
        if (this.props.stationId !== prevProps.stationId)
            await this.init();
    }

    async componentDidMount() {
        await this.init();
    }

    componentWillUnmount() {
        this.hubConnection.off('trackAdded');
        this.musicKit.removeEventListener('playbackStateDidChange');
    }

    async subscribeToStationEvents() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}hubs`)
            .build();

        await this.hubConnection.start();

        this.hubConnection.on('trackAdded', async (stationId: string, trackId: string, position: number) => {
            if (stationId !== this.props.stationId) {
                return;
            }

            const event = { trackId, position };

            if (!this.station) {
                this.pendingEvents.push(event);
                return;
            }

            await this.addTracks([event]);
        });
    }

    async addTracks(addTrackEvents: Array<IAddTrackEvent>) {
        for (let event of addTrackEvents) {
            // @ts-ignore
            let existingItem = this.musicKit.queue.item(event.position);

            if (this.requestedItems > 0) {
                this.requestedItems--;
            }

            if (!existingItem) {
                const song = await this.musicKit.api.song(event.trackId);

                await this.appendTracksToQueue([song]);

                // @ts-ignore
                if (this.musicKit.queue.items.length === 1) {
                    await this.play();
                }

                return;
            }

            if (existingItem.id === event.trackId) {
                return;
            }

            console.warn(`Position ${event.position} already occupied by a different item.`);
        }
    }

    async handleStateChange(event: MusicKit.Events['playbackStateDidChange']) {
        if (!event) {
            return;
        }

        if (event.state as unknown as PlaybackStates === PlaybackStates.completed)
            playbackEventMediator.notifyPlayEnd();

        if (this.state.suppressEvents)
            return;

        const playing = event.state as unknown as PlaybackStates === PlaybackStates.playing;
        if (this.state.isPlaying !== playing)
            this.setState({ isPlaying: playing });

        const currentTrack = this.state.tracks[this.getCurrentQueuePosition()];
        if (this.state.currentTrack !== currentTrack)
            this.setState({ currentTrack: currentTrack });

        if (this.station.isContinuous) {
            this.topUp();
        }

        await this.handleScrobblingEvent(event)
    }

    async handleScrobblingEvent(event: MusicKit.Events['playbackStateDidChange']) {
        if (!this.isScrobblingEnabled) {
            return;
        }

        if (event.state as unknown as PlaybackStates === PlaybackStates.ended) {
            await this.scrobble();
        }

        if (event.state as unknown as PlaybackStates === PlaybackStates.playing) {
            await this.setNowPlaying();
        }
    }

    get isScrobblingEnabled() {
        return this.props.appState.lastfmAuthenticated && this.props.appState.enableScrobbling;
    }

    async topUp() {
        // @ts-ignore
        const itemsLeft = this.musicKit.queue.items.length - this.getCurrentQueuePosition() + this.requestedItems;
        const itemsToAdd = this.station.size - itemsLeft;

        if (itemsToAdd > 0) {
            this.requestedItems += itemsToAdd;
            await stationApi.topUp(this.props.stationId, this.station.definition.stationType, itemsToAdd);
        }
    }

    getCurrentQueuePosition() {
        // @ts-ignore
        const queuePosition = this.musicKit.queue.position;

        return queuePosition !== -1 ? queuePosition : 0;
    }

    async scrobble() {
        await lastfmApi.postScrobble(this.state.currentTrack.attributes.artistName, this.state.currentTrack.attributes.name);
    }

    async setNowPlaying() {
        await lastfmApi.postNowPlaying(this.state.currentTrack.attributes.artistName, this.state.currentTrack.attributes.name);
    }

    switchPrev = async() => {
        // @ts-ignore
        if (this.musicKit.isPlaying)
            await this.musicKit.pause();

        await this.musicKit.skipToPreviousItem();
    };

    switchNext = async() => {
        // @ts-ignore
        if (this.musicKit.isPlaying)
            await this.musicKit.pause();

        await this.musicKit.skipToNextItem();
    };

    getPlaylistPagingOffset(): number {
        if (this.station.isContinuous) {
            return this.getCurrentQueuePosition();
        }

        return 0;
    }

    render() {
        if (!this.station || !this.state.tracks.length)
            return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <Spinner animation="border" />
            </div>;

        return <div>
            <PlayerControls
                currentTrack={this.state.currentTrack}
                isPlaying={this.state.isPlaying}
                switchPrev={this.switchPrev}
                switchNext={this.switchNext}
                onPlayPause={this.handlePlayPause}
                isScrobblingEnabled={this.isScrobblingEnabled}
                onScrobblingSwitch={this.handleScrobblingSwitch}
                lastfmAuthenticated={this.props.appState.lastfmAuthenticated}/>
            <Playlist
                tracks={this.state.tracks}
                isPlaying={this.state.isPlaying}
                offset={this.getPlaylistPagingOffset()}
                limit={this.station.isContinuous ? 10 : 1000}
                currentTrack={this.state.currentTrack}
                showAlbumInfo={!this.station.isContinuous}
                onTrackSwitch={this.handleTrackSwitched}
                onRemove={this.handleTracksRemoved}
            />
        </div>;
    }

    static getImageUrl(sourceUrl: string, size: number = 400) {
        return sourceUrl && sourceUrl.replace('{w}x{h}', `${size}x${size}`)
            .replace('2000x2000', `${size}x${size}`);
    }

    handlePlayPause = async () => {
        // @ts-ignore
        if (this.musicKit.isPlaying) {
            await this.musicKit.pause();
            playbackEventMediator.notifyPlayEnd();

            return;
        }

        // @ts-ignore
        // await this.musicKit.player.prepareToPlay(this.musicKit.queue.items[this.getCurrentQueuePosition()]);
        await this.play();
    };

    handleTrackSwitched = async index => {
        const offset = this.getPlaylistPagingOffset() + index;
        const track = this.state.tracks[offset];

        if (this.state.currentTrack === track) {
            await this.handlePlayPause();

            return;
        }

        // @ts-ignore
        if (this.musicKit.isPlaying)
            await this.musicKit.pause();

        // @ts-ignore
        await this.musicKit.changeToMediaAtIndex(offset);

        this.setState({ currentTrack: track });

        if (this.station.isContinuous) {
            await this.topUp();
        }
    };

    handleTracksRemoved = async (position: number, count: number) => {
        const offset = this.getPlaylistPagingOffset() + position;

        this.state.tracks.splice(offset, count);
        this.setState({ tracks: this.state.tracks.slice() });

        await stationApi.deleteSongs(this.station.id, offset, count);

        if (this.station.isContinuous) {
            await this.topUp();
        }
    };

    handleScrobblingSwitch = (value: boolean) => {
        this.props.appState.enableScrobbling = value;
    }
}
