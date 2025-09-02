import * as React from 'react';
import musicKit from '../../musicKit';
import * as signalR from '@aspnet/signalr';
import {HubConnection} from '@aspnet/signalr';
import {Playlist} from './Playlist';
import lastfmApi from '../../restClients/LastfmApi';
import stationApi, {IStation} from '../../restClients/StationApi'
import environment from '../../Environment';
import {PlayerControls} from './PlayerControls';
import {Spinner} from 'react-bootstrap';
import {instance as mediaSessionManager} from '../../MediaSessionManager'
import {PlaybackStates} from '../../musicKitEnums';
import { LastfmContext } from '../../lastfm/LastfmContext';
import { AuthenticationState } from '../../authentication';
import MediaItemOptions = MusicKit.MediaItemOptions;

interface IPlayerProps {
    stationId: string;
}

interface IPlayerState {
    currentTrack?: MusicKit.MediaItem;
    tracks: MusicKit.MediaItem[];
    suppressEvents: boolean;
    isPlaying: boolean;
}

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

export class StationPlayer extends React.Component<IPlayerProps, IPlayerState> {
    static contextType = LastfmContext;
    context: React.ContextType<typeof LastfmContext>;

    musicKit: MusicKit.MusicKitInstance;
    pendingEvents: IAddTrackEvent[] = [];
    station: IStation;
    requestedItems = 0;
    hubConnection: HubConnection;

    currentTrackScrobbled = false;

    private playbackStateSubscription: (x: MusicKit.Events['playbackStateDidChange']) => Promise<void>;

    constructor(props: IPlayerProps) {
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
            await this.musicKit.clearQueue();
        } else {
            this.musicKit = await musicKit.getInstance();

            await this.subscribeToStationEvents();

            this.playbackStateSubscription = async (x: MusicKit.Events['playbackStateDidChange']) => await this.handleStateChange(x);
            this.musicKit.addEventListener('playbackStateDidChange', this.playbackStateSubscription);
            this.musicKit.addEventListener('nowPlayingItemDidChange', async (event: MusicKit.Events['nowPlayingItemDidChange']) => {
                if (!event.item) {
                    return;
                }

                document.title = `${event.item.title} - ${event.item.artistName}`;
                this.currentTrackScrobbled = false;

                this.setState({ currentTrack: event.item });

                if (this.isScrobblingEnabled) {
                    await this.setNowPlaying(event.item);
                }

                if (this.station.isContinuous) {
                    this.topUp();
                }

                mediaSessionManager.updateSessionMetadata(event.item.artworkURL);
            });
            this.musicKit.addEventListener('playbackProgressDidChange', async (event: MusicKit.Events['playbackProgressDidChange']) => {
                if (this.currentTrackScrobbled) {
                    return;
                }

                if (event.progress < 0.9) {
                    return;
                }

                if (this.isScrobblingEnabled) {
                    await this.scrobble();
                    this.currentTrackScrobbled = true;
                }
            });

            mediaSessionManager.setNextHandler(() => this.switchNext());
            mediaSessionManager.setPrevHandler(() => this.switchPrev());
        }

        this.station = await stationApi.getStation(this.props.stationId);

        const batchItems = (arr: string[], size: number) =>
            arr.length > size
                ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)]
                : [arr];

        for (let batch of batchItems(this.station.songIds, 300)) {
            if (batch.length) {
                const songs = await this.musicKit.api.music(`/v1/catalog/${this.musicKit.storefrontId}/songs`, { ids: batch });

                await this.appendTracksToQueue(songs.data.data);
            }
        }

        this.setState({ suppressEvents: false });
        if (this.musicKit.queue.items.length) {
            let context = new AudioContext();

            if (context.state === 'running') {
                await this.play();
            }
        }

        await this.addTracks(this.pendingEvents);
        this.pendingEvents = [];
    }

    async play() {
        await this.musicKit.play()
    }

    async appendTracksToQueue(tracks: MusicKit.Songs[]) {
        // @ts-ignore
        const currentTracks = this.state.tracks.concat(tracks);

        await this.musicKit.playLater({ songs: tracks.map(t => t.id) });
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
        if (this.hubConnection) {
            this.hubConnection.off('trackAdded');
        }
        this.musicKit.removeEventListener('playbackStateDidChange');
        this.musicKit.removeEventListener('playbackProgressDidChange');
        this.musicKit.removeEventListener('nowPlayingItemDidChange');
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

    async addTracks(addTrackEvents: IAddTrackEvent[]) {
        for (let event of addTrackEvents) {
            let existingItem = this.musicKit.queue.item(event.position);

            if (!existingItem) {
                let songs = await this.musicKit.api.music(`/v1/catalog/${this.musicKit.storefrontId}/songs`, { ids: [event.trackId] });

                if (songs.data.data.length === 0) {
                    console.warn(`Could not find song with id ${event.trackId}`);
                    return;
                }

                await this.appendTracksToQueue([songs.data.data[0]]);

                if (this.musicKit.queue.items.length === 1) {
                    await this.play();
                }

                return;
            }

            if (this.requestedItems > 0) {
                this.requestedItems--;
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

        if (this.state.suppressEvents)
            return;

        const playing = event.state as unknown as PlaybackStates === PlaybackStates.playing;
        if (this.state.isPlaying !== playing) {
            this.setState({ isPlaying: playing });
        }
    }

    get isScrobblingEnabled() {
        return this.context.authentication.state === AuthenticationState.Authenticated && this.context.isScrobblingEnabled;
    }

    async topUp() {
        const itemsLeft = this.musicKit.queue.items.length - this.getCurrentQueuePosition() + this.requestedItems;
        const itemsToAdd = this.station.size - itemsLeft;

        if (itemsToAdd > 0) {
            this.requestedItems += itemsToAdd;
            await stationApi.topUp(this.props.stationId, this.station.definition.stationType, itemsToAdd);
        }
    }

    getCurrentQueuePosition() {
        const queuePosition = this.musicKit.queue.position;

        return queuePosition !== -1 ? queuePosition : 0;
    }

    async scrobble() {
        await lastfmApi.postScrobble(this.state.currentTrack.attributes.artistName,
                                     this.state.currentTrack.attributes.name,
                                     this.state.currentTrack.attributes.albumName,
                                     this.state.currentTrack.attributes.duration);
    }

    async setNowPlaying(item: MusicKit.MediaItem) {
        await lastfmApi.postNowPlaying(item.attributes.artistName,
                                       item.attributes.name,
                                       item.attributes.albumName,
                                       item.playbackDuration);
    }

    switchPrev = async() => {
        if (this.musicKit.isPlaying)
            this.musicKit.pause();

        await this.musicKit.skipToPreviousItem();
    };

    switchNext = async() => {
        if (this.musicKit.isPlaying)
            this.musicKit.pause();

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
                lastfmAuthenticated={this.context.authentication.state === AuthenticationState.Authenticated}
            />
            <Playlist
                tracks={this.state.tracks}
                isPlaying={this.state.isPlaying}
                offset={this.getPlaylistPagingOffset()}
                limit={this.station.isContinuous ? 10 : 1000}
                currentTrack={this.state.currentTrack}
                showAlbumInfo={this.station.isGroupedByAlbum}
                onTrackSwitch={this.handleTrackSwitched}
                onRemove={this.handleTracksRemoved}
            />
        </div>;
    }

    static getImageUrl(sourceUrl: string, size: number = 400) {
        return sourceUrl
            ? sourceUrl.replace('{w}x{h}', `${size}x${size}`).replace('2000x2000', `${size}x${size}`)
            : 'default-album-cover.png';
    }

    handlePlayPause = async () => {
        if (this.musicKit.isPlaying) {
            this.musicKit.pause();
            return;
        }

        await this.play();
    };

    handleTrackSwitched = async (index: number) => {
        const offset = this.getPlaylistPagingOffset() + index;
        const track = this.state.tracks[offset];

        if (this.state.currentTrack === track) {
            await this.handlePlayPause();

            return;
        }

        if (this.musicKit.isPlaying){
            this.musicKit.pause();
        }

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
        this.context.setIsScrobblingEnabled(value);
    }
}
