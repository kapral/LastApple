import Testing
import Foundation
@testable import Lastream

/// Tests for ScrobbleService behavior.
@Suite("ScrobbleService Tests")
@MainActor
struct ScrobbleServiceTests {
    
    // MARK: - Test Helpers
    
    private func createService() -> ScrobbleService {
        let api = MockLastfmAPI()
        return ScrobbleService(lastfmAPI: api)
    }
    
    // MARK: - Threshold Calculation Tests
    
    @Test("Should scrobble after 50% of short track")
    func testScrobbleThresholdShortTrack() async {
        let service = createService()
        
        // 60 second track, played 31 seconds (>50%)
        #expect(service.shouldScrobble(playedTime: 31, trackDuration: 60) == true)
        
        // 60 second track, played 29 seconds (<50%)
        #expect(service.shouldScrobble(playedTime: 29, trackDuration: 60) == false)
    }
    
    @Test("Should scrobble after minimum 30 seconds")
    func testScrobbleThresholdMinimum30Seconds() async {
        let service = createService()
        
        // Very short track - need at least 30 seconds
        #expect(service.shouldScrobble(playedTime: 29, trackDuration: 40) == false)
        #expect(service.shouldScrobble(playedTime: 31, trackDuration: 40) == true)
    }
    
    @Test("Should scrobble after max 4 minutes for long tracks")
    func testScrobbleThresholdMaximum4Minutes() async {
        let service = createService()
        
        // 10 minute track - should scrobble after 4 minutes (240 seconds), not 5 (50%)
        #expect(service.shouldScrobble(playedTime: 239, trackDuration: 600) == false)
        #expect(service.shouldScrobble(playedTime: 241, trackDuration: 600) == true)
    }
    
    @Test("Should not scrobble with zero duration")
    func testScrobbleThresholdZeroDuration() async {
        let service = createService()
        
        #expect(service.shouldScrobble(playedTime: 100, trackDuration: 0) == false)
    }
    
    // MARK: - Enabled State Tests
    
    @Test("Service isEnabled property can be toggled")
    func testServiceEnabledState() async {
        let service = createService()
        
        // Default is enabled
        service.isEnabled = true
        #expect(service.isEnabled == true)
        
        // Can be disabled
        service.isEnabled = false
        #expect(service.isEnabled == false)
    }
    
    // MARK: - Mock Service Tests
    
    @Test("Mock service tracks now playing calls")
    func testMockNowPlaying() async {
        let service = MockScrobbleService()
        let track = QueueTrack(id: "1", title: "Test", artistName: "Artist", albumName: "Album", duration: 180)
        
        await service.updateNowPlaying(track: track)
        
        #expect(service.updateNowPlayingCallCount == 1)
        #expect(service.lastNowPlayingTrack?.id == "1")
    }
    
    @Test("Mock service tracks scrobble calls")
    func testMockScrobble() async {
        let service = MockScrobbleService()
        let track = QueueTrack(id: "2", title: "Test", artistName: "Artist", albumName: "Album", duration: 180)
        let now = Date()
        
        await service.scrobble(track: track, playedAt: now)
        
        #expect(service.scrobbleCallCount == 1)
        #expect(service.lastScrobbledTrack?.id == "2")
        #expect(service.lastScrobbledAt != nil)
    }
    
    @Test("Mock service tracks track started calls")
    func testMockTrackStarted() async {
        let service = MockScrobbleService()
        let track = QueueTrack(id: "3", title: "Test", artistName: "Artist", albumName: "Album", duration: 180)
        
        await service.onTrackStarted(track)
        
        #expect(service.onTrackStartedCallCount == 1)
        #expect(service.lastTrackStarted?.id == "3")
    }
    
    @Test("Mock service tracks threshold calls")
    func testMockTrackPlayedThreshold() async {
        let service = MockScrobbleService()
        let track = QueueTrack(id: "4", title: "Test", artistName: "Artist", albumName: "Album", duration: 180)
        
        await service.onTrackPlayedThreshold(track)
        
        #expect(service.onTrackPlayedThresholdCallCount == 1)
        #expect(service.lastTrackPlayedThreshold?.id == "4")
    }
    
    @Test("Mock shouldScrobble follows same logic")
    func testMockShouldScrobble() async {
        let service = MockScrobbleService()
        
        // Same logic as real service
        #expect(service.shouldScrobble(playedTime: 31, trackDuration: 60) == true)
        #expect(service.shouldScrobble(playedTime: 29, trackDuration: 60) == false)
        #expect(service.shouldScrobble(playedTime: 241, trackDuration: 600) == true)
    }
}
