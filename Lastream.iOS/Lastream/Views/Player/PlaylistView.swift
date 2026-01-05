import SwiftUI

/// View displaying the playback queue.
struct PlaylistView: View {
    let tracks: [QueueTrack]
    let currentTrackId: String?
    let isPlaying: Bool
    let onTrackSelected: (Int) -> Void
    
    /// Offset for continuous stations (hide played tracks).
    var offset: Int = 0
    
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(Array(tracks.enumerated()), id: \.element.id) { index, track in
                        if index >= offset {
                            PlaylistTrackRow(
                                track: track,
                                index: index - offset + 1,
                                isCurrent: track.id == currentTrackId,
                                isPlaying: isPlaying && track.id == currentTrackId,
                                onTap: { onTrackSelected(index) }
                            )
                            .id(track.id)
                            
                            if index < tracks.count - 1 {
                                Divider()
                                    .background(Color.appBorder)
                                    .padding(.leading, 60)
                            }
                        }
                    }
                }
            }
            .onChange(of: currentTrackId) { _, newId in
                if let id = newId {
                    withAnimation {
                        proxy.scrollTo(id, anchor: .center)
                    }
                }
            }
        }
    }
}

/// A single track row in the playlist.
struct PlaylistTrackRow: View {
    let track: QueueTrack
    let index: Int
    let isCurrent: Bool
    let isPlaying: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Track number or playing indicator
                ZStack {
                    if isPlaying {
                        PlayingIndicator()
                    } else if isCurrent {
                        Image(systemName: "pause.fill")
                            .font(.caption)
                            .foregroundColor(.appAccent)
                    } else {
                        Text("\(index)")
                            .font(.caption)
                            .foregroundColor(.appTextMuted)
                            .monospacedDigit()
                    }
                }
                .frame(width: 24)
                
                // Album artwork
                AsyncImage(url: track.artworkURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    default:
                        ZStack {
                            Color.appSecondaryBackground
                            Image(systemName: "music.note")
                                .font(.caption)
                                .foregroundColor(.appTextMuted)
                        }
                    }
                }
                .frame(width: 40, height: 40)
                .cornerRadius(4)
                
                // Track info
                VStack(alignment: .leading, spacing: 2) {
                    Text(track.title)
                        .font(.subheadline)
                        .foregroundColor(isCurrent ? .appAccent : .appText)
                        .lineLimit(1)
                    
                    Text(track.artistName)
                        .font(.caption)
                        .foregroundColor(.appTextMuted)
                        .lineLimit(1)
                }
                
                Spacer()
                
                // Duration
                Text(formatDuration(track.duration))
                    .font(.caption)
                    .foregroundColor(.appTextMuted)
                    .monospacedDigit()
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(isCurrent ? Color.appAccent.opacity(0.1) : Color.clear)
        }
        .buttonStyle(.plain)
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

/// Grouped playlist view that groups tracks by album.
struct GroupedPlaylistView: View {
    let tracks: [QueueTrack]
    let currentTrackId: String?
    let isPlaying: Bool
    let onTrackSelected: (Int) -> Void
    
    private var groupedTracks: [(album: String, tracks: [(index: Int, track: QueueTrack)])] {
        var groups: [(album: String, tracks: [(index: Int, track: QueueTrack)])] = []
        var currentAlbum = ""
        
        for (index, track) in tracks.enumerated() {
            if track.albumName != currentAlbum {
                currentAlbum = track.albumName
                groups.append((album: currentAlbum, tracks: [(index, track)]))
            } else {
                groups[groups.count - 1].tracks.append((index, track))
            }
        }
        
        return groups
    }
    
    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 0) {
                ForEach(groupedTracks, id: \.album) { group in
                    // Album header
                    HStack(spacing: 12) {
                        if let artworkURL = group.tracks.first?.track.artworkURL {
                            AsyncImage(url: artworkURL) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                default:
                                    Color.appSecondaryBackground
                                }
                            }
                            .frame(width: 48, height: 48)
                            .cornerRadius(6)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(group.album)
                                .font(.headline)
                                .foregroundColor(.appText)
                                .lineLimit(1)
                            
                            Text("\(group.tracks.count) tracks")
                                .font(.caption)
                                .foregroundColor(.appTextMuted)
                        }
                        
                        Spacer()
                    }
                    .padding()
                    .background(Color.appSecondaryBackground.opacity(0.5))
                    
                    // Tracks in group
                    ForEach(group.tracks, id: \.track.id) { item in
                        PlaylistTrackRow(
                            track: item.track,
                            index: item.index + 1,
                            isCurrent: item.track.id == currentTrackId,
                            isPlaying: isPlaying && item.track.id == currentTrackId,
                            onTap: { onTrackSelected(item.index) }
                        )
                        
                        if item.index < group.tracks.last?.index ?? 0 {
                            Divider()
                                .background(Color.appBorder)
                                .padding(.leading, 76)
                        }
                    }
                }
            }
        }
    }
}

#if DEBUG
#Preview {
    let tracks = [
        QueueTrack(id: "1", title: "Creep", artistName: "Radiohead", albumName: "Pablo Honey", duration: 239),
        QueueTrack(id: "2", title: "Anyone Can Play Guitar", artistName: "Radiohead", albumName: "Pablo Honey", duration: 217),
        QueueTrack(id: "3", title: "Karma Police", artistName: "Radiohead", albumName: "OK Computer", duration: 264),
        QueueTrack(id: "4", title: "Paranoid Android", artistName: "Radiohead", albumName: "OK Computer", duration: 386)
    ]
    
    PlaylistView(
        tracks: tracks,
        currentTrackId: "2",
        isPlaying: true,
        onTrackSelected: { _ in }
    )
    .background(Color.appBackground)
}
#endif
