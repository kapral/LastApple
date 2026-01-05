import SwiftUI

/// Main station player view that combines all player components.
struct StationPlayerView: View {
    let stationId: String
    let onBack: () -> Void
    
    @State private var viewModel: StationPlayerViewModel
    
    init(
        stationId: String,
        onBack: @escaping () -> Void,
        stationAPI: StationAPIProtocol = StationAPI(client: APIClient.shared)
    ) {
        self.stationId = stationId
        self.onBack = onBack
        self._viewModel = State(initialValue: StationPlayerViewModel(
            stationId: stationId,
            stationAPI: stationAPI
        ))
    }
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            if viewModel.isLoading {
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.5)
                    Text("Loading station...")
                        .font(.subheadline)
                        .foregroundColor(.appTextMuted)
                }
            } else if let error = viewModel.error {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.yellow)
                    
                    Text("Failed to load station")
                        .font(.headline)
                        .foregroundColor(.appText)
                    
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.appTextMuted)
                        .multilineTextAlignment(.center)
                    
                    Button("Try Again") {
                        Task {
                            await viewModel.loadStation()
                        }
                    }
                    .buttonStyle(.appPrimary)
                }
                .padding()
            } else {
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button(action: onBack) {
                            Image(systemName: "chevron.down")
                                .font(.title2)
                                .foregroundColor(.appText)
                        }
                        
                        Spacer()
                        
                        if let station = viewModel.station {
                            Text(station.stationType?.title ?? "Station")
                                .font(.headline)
                                .foregroundColor(.appText)
                        }
                        
                        Spacer()
                        
                        // Placeholder for symmetry
                        Image(systemName: "chevron.down")
                            .font(.title2)
                            .foregroundColor(.clear)
                    }
                    .padding()
                    
                    // Now Playing
                    NowPlayingView(
                        track: viewModel.currentTrack,
                        isPlaying: viewModel.isPlaying
                    )
                    .padding(.horizontal)
                    
                    // Player Controls
                    PlayerControlsView(
                        isPlaying: viewModel.isPlaying,
                        currentTime: viewModel.currentTime,
                        duration: viewModel.duration,
                        onPlayPause: {
                            Task { await viewModel.togglePlayPause() }
                        },
                        onSkipPrevious: {
                            Task { await viewModel.skipToPrevious() }
                        },
                        onSkipNext: {
                            Task { await viewModel.skipToNext() }
                        },
                        onSeek: { time in
                            Task { await viewModel.seek(to: time) }
                        }
                    )
                    .padding(.top)
                    
                    // Playlist
                    PlaylistView(
                        tracks: viewModel.queue,
                        currentTrackId: viewModel.currentTrack?.id,
                        isPlaying: viewModel.isPlaying,
                        onTrackSelected: { index in
                            Task { await viewModel.skipTo(index: index) }
                        },
                        offset: viewModel.station?.isContinuous == true ? viewModel.queuePosition : 0
                    )
                    .background(Color.appSecondaryBackground.opacity(0.3))
                }
            }
        }
        .task {
            await viewModel.loadStation()
        }
        .onDisappear {
            Task {
                await viewModel.cleanup()
            }
        }
    }
}

/// View model for the station player.
@Observable
@MainActor
final class StationPlayerViewModel {
    private(set) var station: Station?
    private(set) var queue: [QueueTrack] = []
    private(set) var currentTrack: QueueTrack?
    private(set) var isPlaying: Bool = false
    private(set) var currentTime: TimeInterval = 0
    private(set) var duration: TimeInterval = 0
    private(set) var queuePosition: Int = 0
    private(set) var isLoading: Bool = true
    private(set) var error: String?
    
    private let stationId: String
    private let stationAPI: StationAPIProtocol
    private let player: any MusicPlayerProtocol
    private let hubService: StationHubServiceProtocol?
    
    private var playerObserverTask: Task<Void, Never>?
    
    init(
        stationId: String,
        stationAPI: StationAPIProtocol,
        player: any MusicPlayerProtocol = MusicPlayerService.shared,
        hubService: StationHubServiceProtocol? = StationHubService.shared
    ) {
        self.stationId = stationId
        self.stationAPI = stationAPI
        self.player = player
        self.hubService = hubService
    }
    
    // Note: No deinit needed - Task will be cancelled when the view is deallocated.
    
    // MARK: - Loading
    
    func loadStation() async {
        isLoading = true
        error = nil
        
        do {
            // Connect to SignalR hub for real-time updates
            await connectToHub()
            
            // Fetch station data
            let stationData = try await stationAPI.getStation(id: stationId)
            station = stationData
            
            // Load songs into player
            try await player.loadSongs(ids: stationData.songIds)
            
            // Sync state from player
            syncFromPlayer()
            
            // Start observing player changes
            startPlayerObserver()
            
            // Auto-play
            try await player.play()
            
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }
    
    /// Cleans up resources when the player is dismissed.
    func cleanup() async {
        playerObserverTask?.cancel()
        playerObserverTask = nil
        hubService?.unsubscribeFromStation()
        await hubService?.disconnect()
    }
    
    // MARK: - Playback Controls
    
    func togglePlayPause() async {
        do {
            try await player.togglePlayPause()
        } catch {
            self.error = "Failed to toggle playback: \(error.localizedDescription)"
        }
    }
    
    func skipToNext() async {
        do {
            try await player.skipToNext()
            
            // Top up continuous stations
            if station?.isContinuous == true {
                await topUpIfNeeded()
            }
        } catch {
            self.error = "Failed to skip: \(error.localizedDescription)"
        }
    }
    
    func skipToPrevious() async {
        do {
            try await player.skipToPrevious()
        } catch {
            self.error = "Failed to skip: \(error.localizedDescription)"
        }
    }
    
    func seek(to time: TimeInterval) async {
        do {
            try await player.seek(to: time)
        } catch {
            self.error = "Failed to seek: \(error.localizedDescription)"
        }
    }
    
    func skipTo(index: Int) async {
        do {
            try await player.skipTo(index: index)
        } catch {
            self.error = "Failed to skip to track: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Private Methods
    
    private func syncFromPlayer() {
        queue = player.queue
        currentTrack = player.currentTrack
        isPlaying = player.state == .playing
        currentTime = player.currentTime
        duration = player.duration
        queuePosition = player.queuePosition
    }
    
    private func startPlayerObserver() {
        playerObserverTask?.cancel()
        playerObserverTask = Task { @MainActor in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(100))
                
                guard !Task.isCancelled else { break }
                
                // Sync state from player
                syncFromPlayer()
            }
        }
    }
    
    private func topUpIfNeeded() async {
        guard let station = station, station.isContinuous,
              let stationType = station.stationType else { return }
        
        let queueLength = queue.count
        let itemsLeft = queueLength - queuePosition
        let threshold = 5 // Request more tracks when less than 5 remaining
        
        if itemsLeft < threshold {
            let itemsToAdd = station.size - itemsLeft
            if itemsToAdd > 0 {
                do {
                    try await stationAPI.topUpStation(id: stationId, type: stationType, count: itemsToAdd)
                } catch {
                    print("Failed to top up station: \(error)")
                }
            }
        }
    }
    
    // MARK: - SignalR Integration
    
    private func connectToHub() async {
        guard let hubService = hubService else { return }
        
        do {
            try await hubService.connect()
            hubService.subscribeToStation(id: stationId)
            
            // Handle track additions from the server
            hubService.onTrackAdded { [weak self] stationId, trackId, position in
                Task { @MainActor in
                    await self?.handleTrackAdded(trackId: trackId, position: position)
                }
            }
        } catch {
            // SignalR connection failure is non-fatal
            // The app will still work, just without real-time updates
            print("Failed to connect to SignalR hub: \(error)")
        }
    }
    
    private func handleTrackAdded(trackId: String, position: Int) async {
        // Add the new track to the player queue
        do {
            try await player.addToQueue(songId: trackId)
            
            // Update local station data
            station?.songIds.append(trackId)
            
            // Sync queue from player
            syncFromPlayer()
        } catch {
            print("Failed to add track to queue: \(error)")
        }
    }
}

#if DEBUG
#Preview {
    StationPlayerView(stationId: "test-station", onBack: {})
        .environment(PreviewHelpers.makeAppleMusicAuthService())
        .environment(PreviewHelpers.makeLastfmAuthService())
}
#endif
