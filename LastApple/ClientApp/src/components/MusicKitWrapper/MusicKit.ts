enum PlaybackState {
    Completed = 'completed',
    Ended = 'ended',
    Loading = 'loading',
    None = 'none',
    Paused = 'paused',
    Playing = 'playing',
    Seeking = 'seeking',
    Stalled = 'stalled',
    Stopped = 'stopped',
    Waiting = 'waiting'
};

interface ISetQueueOptions {
    album?: string;
    playlist?: string;
    song?: string;
    songs?: Array<string>;
    url?: string;
    startPosition?: number;
    items?: Array<IMediaItem|string>;
}

export interface IMediaItem {
    title: string;
    albumName: string;
    artistName: string;
    artworkURL: string;
    type: string;
    releaseDate: Date;
}

interface IQueue {
    length: number;
    position: number;
    items: Array<IMediaItem>;

    item(index: number): IMediaItem;
    append(object: IMediaItem): void;
    prepend(object: IMediaItem): void;
    remove(position: number): void;

    addEventListener(name: string, callback: () => any): void;
}

interface IMusicKitPlayer {
    isPlaying: boolean;
    nowPlayingItem: IMediaItem;
    queue: IQueue;

    play(): Promise<void>;
    pause(): void;
    mute(): void;
    stop(): void;
    skipToNextItem(): Promise<void>;
    skipToPreviousItem(): Promise<void>;
    seekToTime(time: number): Promise<void>;
    changeToMediaAtIndex(index: number): Promise<void>;
    changeToMediaItem(descriptor: IMediaItem|string): Promise<void>;
    prepareToPlay(descriptor: IMediaItem|string): Promise<void>;

    addEventListener(name: string, callback: () => any): void;
}

export interface IMusicKit {
    player: IMusicKitPlayer;
    playbackState: PlaybackState;
    authorize(): Promise<void>;
    unauthorize(): Promise<void>;
    setQueue(options: ISetQueueOptions): Promise<void>;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    skipToNextItem(): Promise<void>;
    skipToPreviousItem(): Promise<void>;
    changeToMediaAtIndex(index: number): Promise<void>;
    api: IMusicKitApi;
}

export interface IMediaItemAttributes {
    name?: string;
}

export interface IMediaItemOptions {
    id: string;
    type: string;
    attributes: IMediaItemAttributes;
}

export interface ISearchResult {
    data: Array<IMediaItemOptions>;
}

export interface ISearchResponse {
    artists: ISearchResult;
}

export interface ISearchHints {
    terms: Array<string>;
}

export interface IQueryParameters {
    limit?: number;
}

export interface IMusicKitApi {
    search(term: string, parameters?: IQueryParameters): Promise<ISearchResponse>;
    searchHints(term: string, parameters?: IQueryParameters): Promise<ISearchHints>;
}

interface IAppConfiguration {
    build?: string;
    icon?: string;
    name?: string;
    version?: string;
}

export interface IConfiguration {
    app: IAppConfiguration;
    developerToken?: string;
}

export interface IMusicKitStatic {
    getInstance(): IMusicKit;
    configure(configuration: IConfiguration): IMusicKit;
}

declare var MusicKit: IMusicKitStatic;

export default (<any>window).MusicKit;