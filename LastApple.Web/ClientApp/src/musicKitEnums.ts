export enum PlaybackStates {
    none,
    loading,
    playing,
    paused,
    stopped,
    ended,
    seeking,
    waiting,
    stalled,
    completed
}

export enum PlaybackBitrate {
    HIGH = 256,
    STANDARD = 64,
}