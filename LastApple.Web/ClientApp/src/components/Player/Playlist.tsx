import * as React from "react";
import { PureComponent } from "react";
import { IMediaItemOptions } from "../MusicKitWrapper/MusicKitDefinitions";
import musicKit from '../../musicKit';
import { PlaylistTrack } from "./PlaylistTrack";
import { PlaylistTrackGroup } from "./PlaylistTrackGroup";

interface PlaylistProps {
    currentTrack: IMediaItemOptions;
    isPlaying: boolean;
    tracks: IMediaItemOptions[];
    offset: number;
    limit: number;
    showAlbumInfo: boolean;
    onRemove(position: number, count: number);
    onTrackSwitch(position: number): Promise<void>;
}

export class Playlist extends PureComponent<PlaylistProps> {
    render() {
        if (!this.props.tracks.length)
            return null;

        const visibleTracks = this.getVisibleTracks();

        if (!this.props.showAlbumInfo)
            return <div className="playlist">
                {visibleTracks.map((track, index) => <PlaylistTrack
                    key={index}
                    track={track}
                    isCurrent={this.props.currentTrack === track}
                    isPlaying={this.props.currentTrack === track && this.props.isPlaying}
                    index={index}
                    groupOffset={0}
                    onTrackSwitch={this.props.onTrackSwitch}
                    addToLibrary={this.addToLibrary}
                    addAlbumToLibrary={this.addAlbumToLibrary}
                    onRemove={this.removeItems}
                />)}
            </div>;

        const grouped = this.groupByAlbum(visibleTracks);

        return <div className="playlist">
            {grouped.all.map(group =>
                <PlaylistTrackGroup
                    key={group.index}
                    tracks={group.tracks}
                    currentTrack={this.props.currentTrack}
                    isPlaying={this.props.isPlaying && group.tracks.some(t => t === this.props.currentTrack)}
                    index={group.index}
                    addAlbumToLibrary={this.addAlbumToLibrary}
                    onRemove={this.removeItems}
                >
                    { group.tracks.map((item, index) =>
                        <PlaylistTrack
                            key={index}
                            track={item}
                            isPlaying={item === this.props.currentTrack && this.props.isPlaying}
                            isCurrent={item === this.props.currentTrack}
                            index={index}
                            groupOffset={group.index}
                            onTrackSwitch={this.props.onTrackSwitch}
                            addToLibrary={this.addToLibrary}
                            addAlbumToLibrary={this.addAlbumToLibrary}
                            onRemove={this.props.onRemove}
                        />) }
                </PlaylistTrackGroup>)}
        </div>;
    }
    
    getVisibleTracks() {
        const firstTrackIndex = this.props.offset;
        const lastTrackIndex = firstTrackIndex + this.props.limit;
        
        return this.props.tracks.slice(firstTrackIndex, lastTrackIndex);
    }
    
    groupByAlbum(tracks: IMediaItemOptions[]) {
        return tracks.reduce((groups, next, index) => {
            if (groups.current === next.attributes.albumName) {
                groups.all[groups.all.length - 1].tracks.push(next);
            } else {
                groups.current = next.attributes.albumName;
                groups.all.push({ tracks: [next], index });
            }
            return groups;
        }, { all: [], current: '' });
    }

    removeItems = (position: number, count: number) => {
        for (let i = 0; i < count; i++) {
            musicKit.instance.player.queue.remove(position);
        }

        this.props.onRemove(position, count);
    };

    async addAlbumToLibrary(item: IMediaItemOptions) {
        const albumId = item.relationships.albums.data[0].id;

        await musicKit.instance.api.addToLibrary({ albums: [albumId] });
    }

    async addToLibrary(item: IMediaItemOptions) {
        await musicKit.instance.api.addToLibrary({ songs: [item.id] });
    }
}