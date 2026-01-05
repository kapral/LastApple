import SwiftUI

/// View with playback controls (play/pause, skip, progress).
struct PlayerControlsView: View {
    let isPlaying: Bool
    let currentTime: TimeInterval
    let duration: TimeInterval
    let onPlayPause: () -> Void
    let onSkipPrevious: () -> Void
    let onSkipNext: () -> Void
    let onSeek: (TimeInterval) -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            // Progress bar
            ProgressBar(
                progress: duration > 0 ? currentTime / duration : 0,
                onSeek: { progress in
                    onSeek(progress * duration)
                }
            )
            
            // Time labels
            HStack {
                Text(formatTime(currentTime))
                    .font(.caption)
                    .foregroundColor(.appTextMuted)
                    .monospacedDigit()
                
                Spacer()
                
                Text("-\(formatTime(duration - currentTime))")
                    .font(.caption)
                    .foregroundColor(.appTextMuted)
                    .monospacedDigit()
            }
            
            // Playback controls
            HStack(spacing: 40) {
                // Previous
                Button(action: onSkipPrevious) {
                    Image(systemName: "backward.fill")
                        .font(.title2)
                        .foregroundColor(.appText)
                }
                
                // Play/Pause
                Button(action: onPlayPause) {
                    Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                        .font(.system(size: 64))
                        .foregroundColor(.appAccent)
                }
                
                // Next
                Button(action: onSkipNext) {
                    Image(systemName: "forward.fill")
                        .font(.title2)
                        .foregroundColor(.appText)
                }
            }
        }
        .padding()
    }
    
    private func formatTime(_ time: TimeInterval) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

/// Interactive progress bar.
struct ProgressBar: View {
    let progress: Double
    let onSeek: (Double) -> Void
    
    @State private var isDragging = false
    @State private var dragProgress: Double = 0
    
    var displayProgress: Double {
        isDragging ? dragProgress : progress
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background track
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.appBorder)
                    .frame(height: 4)
                
                // Progress track
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.appAccent)
                    .frame(width: max(0, geometry.size.width * displayProgress), height: 4)
                
                // Thumb
                Circle()
                    .fill(Color.appAccent)
                    .frame(width: isDragging ? 16 : 12, height: isDragging ? 16 : 12)
                    .offset(x: max(0, min(geometry.size.width - 12, geometry.size.width * displayProgress - 6)))
                    .shadow(color: .black.opacity(0.2), radius: 2)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        isDragging = true
                        let newProgress = max(0, min(1, value.location.x / geometry.size.width))
                        dragProgress = newProgress
                    }
                    .onEnded { value in
                        isDragging = false
                        let finalProgress = max(0, min(1, value.location.x / geometry.size.width))
                        onSeek(finalProgress)
                    }
            )
        }
        .frame(height: 20)
        .animation(.easeOut(duration: 0.1), value: isDragging)
    }
}

/// Mini player controls for compact display.
struct MiniPlayerControls: View {
    let isPlaying: Bool
    let onPlayPause: () -> Void
    let onSkipNext: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            Button(action: onPlayPause) {
                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                    .font(.title3)
                    .foregroundColor(.appText)
            }
            
            Button(action: onSkipNext) {
                Image(systemName: "forward.fill")
                    .font(.title3)
                    .foregroundColor(.appText)
            }
        }
    }
}

#if DEBUG
#Preview {
    VStack {
        PlayerControlsView(
            isPlaying: true,
            currentTime: 65,
            duration: 239,
            onPlayPause: {},
            onSkipPrevious: {},
            onSkipNext: {},
            onSeek: { _ in }
        )
    }
    .padding()
    .background(Color.appBackground)
}
#endif
