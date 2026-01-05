import SwiftUI

/// View displaying the currently playing track with artwork and info.
struct NowPlayingView: View {
    let track: QueueTrack?
    let isPlaying: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            // Album artwork
            AsyncImage(url: track?.artworkURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                case .failure:
                    albumPlaceholder
                case .empty:
                    albumPlaceholder
                @unknown default:
                    albumPlaceholder
                }
            }
            .frame(width: 56, height: 56)
            .cornerRadius(8)
            .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
            
            // Track info
            if let track = track {
                VStack(alignment: .leading, spacing: 4) {
                    Text(track.title)
                        .font(.headline)
                        .foregroundColor(.appText)
                        .lineLimit(1)
                    
                    Text(track.artistName)
                        .font(.subheadline)
                        .foregroundColor(.appTextMuted)
                        .lineLimit(1)
                    
                    Text(track.albumName)
                        .font(.caption)
                        .foregroundColor(.appTextMuted)
                        .lineLimit(1)
                }
                
                Spacer()
                
                // Playing indicator
                if isPlaying {
                    PlayingIndicator()
                }
            } else {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Not Playing")
                        .font(.headline)
                        .foregroundColor(.appTextMuted)
                    
                    Text("Select a track to play")
                        .font(.subheadline)
                        .foregroundColor(.appTextMuted)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Color.appSecondaryBackground)
        .cornerRadius(12)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityDescription)
    }
    
    private var accessibilityDescription: String {
        if let track = track {
            let playingState = isPlaying ? "Now playing" : "Paused"
            return "\(playingState): \(track.title) by \(track.artistName) from \(track.albumName)"
        } else {
            return "Not playing. Select a track to play."
        }
    }
    
    private var albumPlaceholder: some View {
        ZStack {
            Color.appSecondaryBackground
            Image(systemName: "music.note")
                .font(.title2)
                .foregroundColor(.appTextMuted)
        }
        .accessibilityHidden(true)
    }
}

/// Animated playing indicator (equalizer bars).
struct PlayingIndicator: View {
    @State private var heights: [CGFloat] = [0.3, 0.5, 0.7, 0.4]
    
    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<4, id: \.self) { index in
                RoundedRectangle(cornerRadius: 1)
                    .fill(Color.appAccent)
                    .frame(width: 3, height: 16 * heights[index])
            }
        }
        .frame(height: 16)
        .onAppear {
            withAnimation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true)) {
                heights = [0.7, 0.4, 0.5, 0.8]
            }
        }
    }
}

#if DEBUG
#Preview {
    VStack(spacing: 20) {
        NowPlayingView(
            track: QueueTrack(
                id: "1",
                title: "Creep",
                artistName: "Radiohead",
                albumName: "Pablo Honey",
                artworkURL: nil,
                duration: 239
            ),
            isPlaying: true
        )
        
        NowPlayingView(
            track: nil,
            isPlaying: false
        )
    }
    .padding()
    .background(Color.appBackground)
}
#endif
