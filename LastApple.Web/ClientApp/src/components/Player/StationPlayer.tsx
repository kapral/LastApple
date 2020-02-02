import * as React from 'react';
import musicKit from '../../musicKit';
import {
    IEvent,
    IMediaItemOptions,
    IMusicKit,
    IStateChangeEvent,
    PlaybackState
} from '../MusicKitWrapper/MusicKitDefinitions';
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


interface IPlayerProps extends BaseProps {
    stationId: string;
}

interface IPlayerState {
    currentTrack?: IMediaItemOptions;
    tracks: Array<IMediaItemOptions>;
    suppressEvents: boolean;
    isPlaying: boolean;
}

interface IAddTrackEvent {
    trackId: string;
    position: number;
}

@observer
export class StationPlayer extends React.Component<IPlayerProps, IPlayerState> {
    musicKit: IMusicKit;
    pendingEvents: Array<IAddTrackEvent> = [];
    station: IStation;
    requestedItems = 0;
    hubConnection: HubConnection;

    private playbackStateSubscription: (x: IEvent) => Promise<void>;

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

            this.playbackStateSubscription = async (x: IEvent) => await this.handleStateChange(x as IStateChangeEvent);
            this.musicKit.player.addEventListener('playbackStateDidChange', this.playbackStateSubscription);
            this.musicKit.player.addEventListener('mediaItemDidChange', event => { document.title = `${event.item.title} - ${event.item.artistName}`; });
        }

        this.station = await stationApi.getStation(this.props.stationId);

        const batchItems = (arr, size) =>
            arr.length > size
                ? [arr.slice(0, size), ...batchItems(arr.slice(size), size)]
                : [arr];

        for (let batch of batchItems(this.station.songIds, 300)) {
            if (batch.length) {
                const songs = await this.musicKit.api.songs(batch);
                this.appendTracksToQueue(songs);
            }
        }

        this.setState({ suppressEvents: false });
        if (this.musicKit.player.queue.items.length) {
            await this.play();
        }

        await this.addTracks(this.pendingEvents);
        this.pendingEvents = [];
    }
    
    async play() {
        await this.musicKit.player.play();
        playbackEventMediator.notifyPlayStart();
    }

    async appendTracksToQueue(tracks: IMediaItemOptions | IMediaItemOptions[]) {
        const currentTracks = this.state.tracks.concat(tracks);

        await this.musicKit.player.queue.append(tracks);
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
        this.musicKit.player.removeEventListener('playbackStateDidChange', this.playbackStateSubscription);
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
            let existingItem = this.musicKit.player.queue.item(event.position);

            if (this.requestedItems > 0) {
                this.requestedItems--;
            }

            if (!existingItem) {
                const song = await this.musicKit.api.song(event.trackId);

                this.appendTracksToQueue(song);

                if (this.musicKit.player.queue.items.length === 1) {
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

    async handleStateChange(event: IStateChangeEvent) {
        if (!event) {
            return;
        }
        
        if (event.state === PlaybackState.Completed)
            playbackEventMediator.notifyPlayEnd();

        if (this.state.suppressEvents)
            return;

        const playing = event.state === PlaybackState.Playing;
        if (this.state.isPlaying !== playing)
            this.setState({ isPlaying: playing });

        const currentTrack = this.state.tracks[this.getCurrentQueuePosition()];
        if (this.state.currentTrack !== currentTrack)
            this.setState({ currentTrack: currentTrack });

        if (this.station.isContinuous) {
            this.topUp();
        }

        this.handleScrobblingEvent(event)
    }

    async handleScrobblingEvent(event: IStateChangeEvent) {
        if (!this.isScrobblingEnabled) {
            return;
        }

        if (event.state === PlaybackState.Ended) {
            await this.scrobble();
        }

        if (event.state === PlaybackState.Playing) {
            await this.setNowPlaying();
        }
    }

    get isScrobblingEnabled() {
        return this.props.appState.lastfmAuthenticated && this.props.appState.enableScrobbling;
    }

    async topUp() {
        const itemsLeft = this.musicKit.player.queue.items.length - this.getCurrentQueuePosition() + this.requestedItems;
        const itemsToAdd = this.station.size - itemsLeft;

        if (itemsToAdd > 0) {
            this.requestedItems += itemsToAdd;
            await stationApi.topUp(this.props.stationId, this.station.definition.stationType, itemsToAdd);
        }
    }

    getCurrentQueuePosition() {
        const queuePosition = this.musicKit.player.queue.position;

        return queuePosition !== -1 ? queuePosition : 0;
    }

    async scrobble() {
        await lastfmApi.postScrobble(this.state.currentTrack.attributes.artistName, this.state.currentTrack.attributes.name);
    }

    async setNowPlaying() {
        await lastfmApi.postNowPlaying(this.state.currentTrack.attributes.artistName, this.state.currentTrack.attributes.name);
    }

    switchPrev = async() => {
        if (this.musicKit.player.isPlaying)
            await this.musicKit.player.pause();
        
        await this.musicKit.player.skipToPreviousItem();
    };

    switchNext = async() => {
        if (this.musicKit.player.isPlaying)
            await this.musicKit.player.pause();
        
        await this.musicKit.player.skipToNextItem();
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

    static get400x400ImageUrl(sourceUrl: string) {
        return sourceUrl && sourceUrl.replace('{w}x{h}', '400x400')
            .replace('2000x2000', '400x400');
    }

    handlePlayPause = async () => {
        if (this.musicKit.player.isPlaying) {
            await this.musicKit.player.pause();
            playbackEventMediator.notifyPlayEnd();
            
            return;
        }

        await this.musicKit.player.prepareToPlay(this.musicKit.player.queue.items[this.getCurrentQueuePosition()]);
        await this.play();
    };

    handleTrackSwitched = async index => {
        const offset = this.getPlaylistPagingOffset() + index;
        const track = this.state.tracks[offset];

        if (this.state.currentTrack === track) {
            await this.handlePlayPause();

            return;
        }

        if (this.musicKit.player.isPlaying)
            await this.musicKit.player.pause();
        
        await this.musicKit.player.changeToMediaAtIndex(offset);

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
