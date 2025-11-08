import React, { memo, useCallback } from 'react';
import musicKit from '../../musicKit';
import { PlaylistTrack } from "./PlaylistTrack";
import { PlaylistTrackGroup } from "./PlaylistTrackGroup";

interface PlaylistProps {
    currentTrack: MusicKit.MediaItem;
    isPlaying: boolean;
    tracks: MusicKit.MediaItem[];
    offset: number;
    limit: number;
    showAlbumInfo: boolean;
    onRemove(position: number, count: number);
    onTrackSwitch(position: number): Promise<void>;
}

export const Playlist: React.FC<PlaylistProps> = memo(({ 
    currentTrack, 
    isPlaying, 
    tracks, 
    offset, 
    limit, 
    showAlbumInfo, 
    onRemove, 
    onTrackSwitch 
}) => {
    const getVisibleTracks = useCallback(() => {
        const firstTrackIndex = offset;
        const lastTrackIndex = firstTrackIndex + limit;

        return tracks.slice(firstTrackIndex, lastTrackIndex);
    }, [tracks, offset, limit]);

    const groupByAlbum = useCallback((tracksToGroup: MusicKit.MediaItem[]) => {
        return tracksToGroup.reduce((groups, next, index) => {
            if (groups.current === next.attributes.albumName) {
                groups.all[groups.all.length - 1].tracks.push(next);
            } else {
                groups.current = next.attributes.albumName;
                groups.all.push({ tracks: [next], index });
            }
            return groups;
        }, { all: [], current: '' });
    }, []);

    const removeItems = useCallback((position: number, count: number) => {
        // todo: implement remove from queue by entire queue reset
        //onRemove(position, count);
    }, []);

    const addAlbumToLibrary = useCallback(async (item: MusicKit.MediaItem) => {
        const albumId = item.relationships.albums.data[0].id;

        await musicKit.instance.api.music('/v1/me/library', { ids: { albums:[albumId] } }, { fetchOptions: { method: 'POST' } });
    }, []);

    const addToLibrary = useCallback(async (item: MusicKit.MediaItem) => {
        await musicKit.instance.api.music('/v1/me/library', { ids: { songs:[item.id] } }, { fetchOptions: { method: 'POST' } });
    }, []);

    if (!tracks.length)
        return null;

    const visibleTracks = getVisibleTracks();

    if (!showAlbumInfo)
        return <div className="playlist">
            {visibleTracks.map((track, index) => <PlaylistTrack
                key={index}
                track={track}
                isCurrent={currentTrack && track && currentTrack.id === track.id}
                isPlaying={currentTrack && track && isPlaying && currentTrack.id === track.id}
                index={index}
                groupOffset={0}
                onTrackSwitch={onTrackSwitch}
                addToLibrary={addToLibrary}
                addAlbumToLibrary={addAlbumToLibrary}
                onRemove={removeItems}
            />)}
        </div>;

    const grouped = groupByAlbum(visibleTracks);

    return <div className="playlist">
        {grouped.all.map(group =>
            <PlaylistTrackGroup
                key={group.index}
                tracks={group.tracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying && group.tracks.some(t => t === currentTrack)}
                index={group.index}
                addAlbumToLibrary={addAlbumToLibrary}
                onRemove={removeItems}
            >
                { group.tracks.map((item, index) =>
                    <PlaylistTrack
                        key={index}
                        track={item}
                        isPlaying={isPlaying && item.id === currentTrack.id}
                        isCurrent={currentTrack && item.id === currentTrack.id}
                        index={index}
                        groupOffset={group.index}
                        onTrackSwitch={onTrackSwitch}
                        addToLibrary={addToLibrary}
                        addAlbumToLibrary={addAlbumToLibrary}
                        onRemove={onRemove}
                    />) }
            </PlaylistTrackGroup>)}
    </div>;
});