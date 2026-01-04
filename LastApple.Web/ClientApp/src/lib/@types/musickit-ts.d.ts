declare namespace MusicKit {
    interface MusicKitInstance {
        removeEventListener<T extends keyof MusicKit.Events>(name: string, callback?: (event: MusicKit.Events[T]) => any): void;
        currentPlaybackDuration: number;
        queue: Queue;
        isPlaying: boolean;
        volume: number;
        shuffleMode: number;
        stop(): Promise<void>;
        clearQueue(): Promise<Queue>;
        api: {
            music: (path: string, params: { ids: string[] } | { term: string, types: string[], l: string })
                => Promise<{ data: { data?: MusicKitMediaItem[], results: { artists: { data: MusicKitMediaItem[] } } } }>
        };
    }

    interface MediaItem {
        relationships: {
            albums: Relationship<Albums>;
            artists: Relationship<Artists>;
            genres: Relationship<Genres>;
            station: Relationship<Stations>;
            composers: Relationship<Artists>;
            library: Relationship<LibraryAlbums>;
            'music-videos': Relationship<MusicVideos>;
        }
    }

    type ResultsResponse = {
        data: {
            results: {
                activities?: SearchResult<Activities>;
                albums?: SearchResult<Albums>;
                'apple-curators'?: SearchResult<AppleCurators>;
                artists?: SearchResult<Artists>;
                curators?: SearchResult<Curators>;
                'music-videos'?: SearchResult<MusicVideos>;
                playlists?: SearchResult<Playlists>;
                'record-labels'?: SearchResult<RecordLabels>;
                stations?: SearchResult<Stations>;
                songs?: SearchResult<Songs>;
                top?: {
                    data: Array<
                        | Activities
                        | Albums
                        | AppleCurators
                        | Artists
                        | Curators
                        | MusicVideos
                        | Playlists
                        | RecordLabels
                        | Songs
                        | Stations
                    >;
                };
            }
        }
    };

    type DataResponse = {
        data: Array<
            | Activities
            | Albums
            | AppleCurators
            | Artists
            | Curators
            | MusicVideos
            | Playlists
            | RecordLabels
            | Songs
            | Stations
        >;
    };

    interface API {
        music(
            path: string,
            parameters?: QueryParameters,
            options?: any
        ): Promise<any>;
    }
    interface Events {
        nowPlayingItemDidChange: { item: MusicKit.MediaItem };
    }
}
