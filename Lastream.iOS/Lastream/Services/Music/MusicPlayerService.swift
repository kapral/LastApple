import Foundation
@preconcurrency import MusicKit
import Observation

/// Represents the current playback state.
enum PlaybackState: Equatable, Sendable {
    case stopped
    case playing
    case paused
    case loading
    case interrupted
}

/// Represents a track in the player queue.
struct QueueTrack: Identifiable, Equatable, Sendable {
    let id: String
    let title: String
    let artistName: String
    let albumName: String
    let artworkURL: URL?
    let duration: TimeInterval
    
    init(from song: Song) {
        self.id = song.id.rawValue
        self.title = song.title
        self.artistName = song.artistName
        self.albumName = song.albumTitle ?? "Unknown Album"
        self.artworkURL = song.artwork?.url(width: 300, height: 300)
        self.duration = song.duration ?? 0
    }
    
    init(id: String, title: String, artistName: String, albumName: String, artworkURL: URL? = nil, duration: TimeInterval = 0) {
        self.id = id
        self.title = title
        self.artistName = artistName
        self.albumName = albumName
        self.artworkURL = artworkURL
        self.duration = duration
    }
}

/// Protocol for music player operations.
@MainActor
protocol MusicPlayerProtocol: AnyObject {
    /// The current playback state.
    var state: PlaybackState { get }
    
    /// The current track being played.
    var currentTrack: QueueTrack? { get }
    
    /// The current queue of tracks.
    var queue: [QueueTrack] { get }
    
    /// Current playback time in seconds.
    var currentTime: TimeInterval { get }
    
    /// Total duration of current track in seconds.
    var duration: TimeInterval { get }
    
    /// Current position in the queue (0-based).
    var queuePosition: Int { get }
    
    /// Starts playback.
    func play() async throws
    
    /// Pauses playback.
    func pause()
    
    /// Toggles play/pause.
    func togglePlayPause() async throws
    
    /// Skips to the next track.
    func skipToNext() async throws
    
    /// Skips to the previous track.
    func skipToPrevious() async throws
    
    /// Seeks to a specific time in the current track.
    func seek(to time: TimeInterval) async throws
    
    /// Skips to a specific track in the queue.
    func skipTo(index: Int) async throws
    
    /// Loads songs into the queue by IDs.
    func loadSongs(ids: [String]) async throws
    
    /// Adds a song to the end of the queue.
    func addToQueue(songId: String) async throws
    
    /// Clears the queue and stops playback.
    func clearQueue() async throws
}

/// Service for controlling music playback using MusicKit.
@Observable
@MainActor
final class MusicPlayerService: MusicPlayerProtocol {
    /// Shared instance.
    static let shared = MusicPlayerService()
    
    /// The current playback state.
    private(set) var state: PlaybackState = .stopped
    
    /// The current track being played.
    private(set) var currentTrack: QueueTrack?
    
    /// The current queue of tracks.
    private(set) var queue: [QueueTrack] = []
    
    /// Current playback time in seconds.
    private(set) var currentTime: TimeInterval = 0
    
    /// Total duration of current track in seconds.
    private(set) var duration: TimeInterval = 0
    
    /// Current position in the queue (0-based).
    private(set) var queuePosition: Int = 0
    
    private let player = ApplicationMusicPlayer.shared
    private var playbackTimeObserver: Task<Void, Never>?
    
    private init() {
        setupObservers()
    }
    
    // Note: No deinit needed - this is a singleton and Task will be
    // automatically cancelled when the service is deallocated.
    
    // MARK: - Playback Controls
    
    func play() async throws {
        state = .loading
        try await player.play()
    }
    
    func pause() {
        player.pause()
    }
    
    func togglePlayPause() async throws {
        switch state {
        case .playing:
            pause()
        case .paused, .stopped:
            try await play()
        default:
            break
        }
    }
    
    func skipToNext() async throws {
        try await player.skipToNextEntry()
        updateCurrentTrack()
    }
    
    func skipToPrevious() async throws {
        try await player.skipToPreviousEntry()
        updateCurrentTrack()
    }
    
    func seek(to time: TimeInterval) async throws {
        player.playbackTime = time
        currentTime = time
    }
    
    func skipTo(index: Int) async throws {
        guard index >= 0 && index < queue.count else { return }
        
        // Skip forward or backward to reach the desired index
        let currentIndex = queuePosition
        
        if index > currentIndex {
            for _ in currentIndex..<index {
                try await player.skipToNextEntry()
            }
        } else if index < currentIndex {
            for _ in index..<currentIndex {
                try await player.skipToPreviousEntry()
            }
        }
        
        updateCurrentTrack()
    }
    
    // MARK: - Queue Management
    
    func loadSongs(ids: [String]) async throws {
        guard !ids.isEmpty else { return }
        
        state = .loading
        
        // Fetch songs from catalog
        let musicIds = ids.map { MusicItemID($0) }
        let request = MusicCatalogResourceRequest<Song>(matching: \.id, memberOf: musicIds)
        let response = try await request.response()
        
        let songs = Array(response.items)
        
        // Update queue
        queue = songs.map { QueueTrack(from: $0) }
        
        // Set player queue
        player.queue = ApplicationMusicPlayer.Queue(for: songs)
        
        // Update current track
        if let firstSong = songs.first {
            currentTrack = QueueTrack(from: firstSong)
            duration = firstSong.duration ?? 0
        }
        
        queuePosition = 0
        state = .stopped
    }
    
    func addToQueue(songId: String) async throws {
        let request = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: MusicItemID(songId))
        let response = try await request.response()
        
        guard let song = response.items.first else { return }
        
        // Add to queue
        queue.append(QueueTrack(from: song))
        
        // Add to player queue
        try await player.queue.insert(song, position: .tail)
    }
    
    func clearQueue() async throws {
        player.pause()
        queue = []
        currentTrack = nil
        queuePosition = 0
        currentTime = 0
        duration = 0
        state = .stopped
    }
    
    // MARK: - Private Methods
    
    private func setupObservers() {
        // Observe playback state changes
        Task { @MainActor in
            for await _ in player.state.objectWillChange.values {
                self.updatePlaybackState()
            }
        }
        
        // Start playback time observer
        startPlaybackTimeObserver()
    }
    
    private func startPlaybackTimeObserver() {
        playbackTimeObserver?.cancel()
        playbackTimeObserver = Task { @MainActor in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(250))
                
                guard !Task.isCancelled else { break }
                
                self.currentTime = self.player.playbackTime
                self.updatePlaybackState()
                self.updateCurrentTrackIfNeeded()
            }
        }
    }
    
    private func updatePlaybackState() {
        switch player.state.playbackStatus {
        case .playing:
            state = .playing
        case .paused:
            state = .paused
        case .stopped:
            state = .stopped
        case .interrupted:
            state = .interrupted
        case .seekingForward, .seekingBackward:
            state = .loading
        @unknown default:
            state = .stopped
        }
    }
    
    private func updateCurrentTrack() {
        if let entry = player.queue.currentEntry,
           case .song(let song) = entry.item {
            currentTrack = QueueTrack(from: song)
            duration = song.duration ?? 0
            
            // Update queue position
            if let index = queue.firstIndex(where: { $0.id == song.id.rawValue }) {
                queuePosition = index
            }
        }
    }
    
    private func updateCurrentTrackIfNeeded() {
        if let entry = player.queue.currentEntry,
           case .song(let song) = entry.item {
            let songId = song.id.rawValue
            
            if currentTrack?.id != songId {
                currentTrack = QueueTrack(from: song)
                duration = song.duration ?? 0
                
                // Update queue position
                if let index = queue.firstIndex(where: { $0.id == songId }) {
                    queuePosition = index
                }
            }
        }
    }
}

// MARK: - Playback Progress

extension MusicPlayerService {
    /// Returns the current playback progress as a value between 0 and 1.
    var progress: Double {
        guard duration > 0 else { return 0 }
        return currentTime / duration
    }
    
    /// Returns the remaining time in seconds.
    var remainingTime: TimeInterval {
        max(0, duration - currentTime)
    }
}
