class PlaybackEventMediator {
    private startHandlers: (() => void)[] = [];
    private endHandlers: (() => void)[] = [];
   
    subscribePlayStart(handler: () => void) {
        this.startHandlers.push(handler);
    }
    
    subscribePlayEnd(handler: () => void) {
        this.endHandlers.push(handler);
    }

    notifyPlayStart() {
        this.startHandlers.forEach(h => h());
    }

    notifyPlayEnd() {
        this.endHandlers.forEach(h => h());
    }
}

export const playbackEventMediator = new PlaybackEventMediator();