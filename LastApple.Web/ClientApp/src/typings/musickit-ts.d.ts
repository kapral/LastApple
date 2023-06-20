declare namespace MusicKit {
    interface MusicKitInstance {
        removeEventListener<T extends keyof MusicKit.Events>(name: string, callback?: (event: MusicKit.Events[T]) => any): void;
    }
}
