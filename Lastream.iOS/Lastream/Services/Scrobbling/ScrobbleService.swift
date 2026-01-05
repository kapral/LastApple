import Foundation
import Observation

/// Protocol for scrobbling service operations.
@MainActor
protocol ScrobbleServiceProtocol: AnyObject {
    /// Whether scrobbling is currently enabled.
    var isEnabled: Bool { get set }
    
    /// Updates the "now playing" status on Last.fm.
    func updateNowPlaying(track: QueueTrack) async
    
    /// Scrobbles a track after it has been played.
    func scrobble(track: QueueTrack, playedAt: Date) async
    
    /// Called when playback starts for a new track.
    func onTrackStarted(_ track: QueueTrack) async
    
    /// Called when a track has been played past the scrobble threshold.
    func onTrackPlayedThreshold(_ track: QueueTrack) async
    
    /// Determines if a track should be scrobbled based on play time.
    func shouldScrobble(playedTime: TimeInterval, trackDuration: TimeInterval) -> Bool
}

/// Service for managing Last.fm scrobbling integration.
@Observable
@MainActor
final class ScrobbleService: ScrobbleServiceProtocol {
    /// Shared instance.
    static let shared = ScrobbleService()
    
    /// Whether scrobbling is currently enabled.
    var isEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: scrobblingEnabledKey) }
        set { UserDefaults.standard.set(newValue, forKey: scrobblingEnabledKey) }
    }
    
    /// The last track that was scrobbled (to avoid duplicates).
    private(set) var lastScrobbledTrack: QueueTrack?
    
    /// The last track that was sent as "now playing".
    private(set) var lastNowPlayingTrack: QueueTrack?
    
    private let lastfmAPI: LastfmAPIProtocol
    private let scrobblingEnabledKey = "scrobblingEnabled"
    
    /// Minimum percentage of track that must be played to scrobble.
    private let scrobbleThresholdPercent = 0.5
    
    /// Minimum seconds that must be played to scrobble.
    private let scrobbleThresholdSeconds: TimeInterval = 30
    
    private init() {
        self.lastfmAPI = LastfmAPI(client: APIClient.shared)
        
        // Enable scrobbling by default if not set
        if UserDefaults.standard.object(forKey: scrobblingEnabledKey) == nil {
            UserDefaults.standard.set(true, forKey: scrobblingEnabledKey)
        }
    }
    
    // For testing
    init(lastfmAPI: LastfmAPIProtocol) {
        self.lastfmAPI = lastfmAPI
    }
    
    // MARK: - Scrobbling
    
    func updateNowPlaying(track: QueueTrack) async {
        guard isEnabled else { return }
        guard track.id != lastNowPlayingTrack?.id else { return }
        
        lastNowPlayingTrack = track
        
        do {
            try await lastfmAPI.updateNowPlaying(
                song: track.title,
                artist: track.artistName,
                album: track.albumName
            )
        } catch {
            // Silently fail - scrobbling is non-critical
            print("Failed to update now playing: \(error)")
        }
    }
    
    func scrobble(track: QueueTrack, playedAt: Date) async {
        guard isEnabled else { return }
        guard track.id != lastScrobbledTrack?.id else { return }
        
        lastScrobbledTrack = track
        
        do {
            try await lastfmAPI.scrobble(
                song: track.title,
                artist: track.artistName,
                album: track.albumName,
                timestamp: playedAt
            )
        } catch {
            // Silently fail - scrobbling is non-critical
            print("Failed to scrobble track: \(error)")
        }
    }
    
    func onTrackStarted(_ track: QueueTrack) async {
        await updateNowPlaying(track: track)
    }
    
    func onTrackPlayedThreshold(_ track: QueueTrack) async {
        await scrobble(track: track, playedAt: Date())
    }
    
    // MARK: - Threshold Calculation
    
    /// Determines if a track should be scrobbled based on play time.
    func shouldScrobble(playedTime: TimeInterval, trackDuration: TimeInterval) -> Bool {
        guard trackDuration > 0 else { return false }
        
        // Scrobble if played for more than 4 minutes or 50% of track duration
        let halfDuration = trackDuration * scrobbleThresholdPercent
        let threshold = min(240, halfDuration) // 4 minutes max
        
        return playedTime >= max(scrobbleThresholdSeconds, threshold)
    }
}
