import Foundation
@testable import Lastream

/// Mock implementation of ScrobbleServiceProtocol for testing.
@MainActor
final class MockScrobbleService: ScrobbleServiceProtocol {
    // MARK: - State
    
    var isEnabled: Bool = true
    
    // MARK: - Call Tracking
    
    var updateNowPlayingCallCount = 0
    var scrobbleCallCount = 0
    var onTrackStartedCallCount = 0
    var onTrackPlayedThresholdCallCount = 0
    
    var lastNowPlayingTrack: QueueTrack?
    var lastScrobbledTrack: QueueTrack?
    var lastScrobbledAt: Date?
    var lastTrackStarted: QueueTrack?
    var lastTrackPlayedThreshold: QueueTrack?
    
    // MARK: - ScrobbleServiceProtocol
    
    func updateNowPlaying(track: QueueTrack) async {
        updateNowPlayingCallCount += 1
        lastNowPlayingTrack = track
    }
    
    func scrobble(track: QueueTrack, playedAt: Date) async {
        scrobbleCallCount += 1
        lastScrobbledTrack = track
        lastScrobbledAt = playedAt
    }
    
    func onTrackStarted(_ track: QueueTrack) async {
        onTrackStartedCallCount += 1
        lastTrackStarted = track
    }
    
    func onTrackPlayedThreshold(_ track: QueueTrack) async {
        onTrackPlayedThresholdCallCount += 1
        lastTrackPlayedThreshold = track
    }
    
    func shouldScrobble(playedTime: TimeInterval, trackDuration: TimeInterval) -> Bool {
        guard trackDuration > 0 else { return false }
        let halfDuration = trackDuration * 0.5
        let threshold = min(240, halfDuration)
        return playedTime >= max(30, threshold)
    }
    
    // MARK: - Test Helpers
    
    func reset() {
        isEnabled = true
        updateNowPlayingCallCount = 0
        scrobbleCallCount = 0
        onTrackStartedCallCount = 0
        onTrackPlayedThresholdCallCount = 0
        lastNowPlayingTrack = nil
        lastScrobbledTrack = nil
        lastScrobbledAt = nil
        lastTrackStarted = nil
        lastTrackPlayedThreshold = nil
    }
}
