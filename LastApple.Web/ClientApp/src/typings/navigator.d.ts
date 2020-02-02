interface Navigator {
    mediaSession?: IMediaSession;
}

interface IMediaSession {
    metadata: MediaMetadata;
    setActionHandler:(event: string, handler: () => void) => void;
}

class MediaMetadata {
    constructor(init?: MediaMetadataInit);
}

interface MediaMetadataInit {
    title?: string;
    artist?: string;
    album?: string;
    artwork?: MediaImage[];
}

interface MediaImage {
    src: string;
    sizes?: string;
    type?: string;
}
