import Testing
import Foundation
@testable import Lastream

/// Tests for MusicPlayerService behavior.
@Suite("MusicPlayerService Tests")
struct MusicPlayerServiceTests {
    
    // MARK: - Helper Functions
    
    private func makeMockPlayer() -> MockMusicPlayerService {
        MockMusicPlayerService()
    }
    
    private func makeTestStation(songIds: [String] = ["song1", "song2", "song3"]) -> Station {
        Station(
            id: "test-station",
            songIds: songIds,
            isContinuous: false,
            isGroupedByAlbum: false,
            size: songIds.count,
            definition: StationDefinition(stationType: "artist")
        )
    }
    
    // MARK: - Playback State Tests
    
    @Test("Initial state is stopped")
    @MainActor
    func testInitialState() async {
        let player = makeMockPlayer()
        
        #expect(player.state == .stopped)
        #expect(player.currentTrack == nil)
        #expect(player.queue.isEmpty)
        #expect(player.currentTime == 0)
        #expect(player.duration == 0)
        #expect(player.queuePosition == 0)
    }
    
    @Test("Play changes state to playing")
    @MainActor
    func testPlayChangesState() async throws {
        let player = makeMockPlayer()
        
        try await player.play()
        
        #expect(player.state == .playing)
        #expect(player.playCallCount == 1)
    }
    
    @Test("Pause changes state to paused")
    @MainActor
    func testPauseChangesState() async throws {
        let player = makeMockPlayer()
        try await player.play()
        
        player.pause()
        
        #expect(player.state == .paused)
        #expect(player.pauseCallCount == 1)
    }
    
    @Test("Toggle play/pause switches between playing and paused")
    @MainActor
    func testTogglePlayPause() async throws {
        let player = makeMockPlayer()
        
        try await player.togglePlayPause()
        #expect(player.state == .playing)
        
        try await player.togglePlayPause()
        #expect(player.state == .paused)
        
        #expect(player.togglePlayPauseCallCount == 2)
    }
    
    // MARK: - Queue Management Tests
    
    @Test("Load songs populates the queue")
    @MainActor
    func testLoadSongsPopulatesQueue() async throws {
        let player = makeMockPlayer()
        let songIds = ["song1", "song2", "song3"]
        
        try await player.loadSongs(ids: songIds)
        
        #expect(player.queue.count == 3)
        #expect(player.currentTrack?.id == "song1")
        #expect(player.queuePosition == 0)
        #expect(player.loadSongsCallCount == 1)
        #expect(player.lastLoadedSongIds == songIds)
    }
    
    @Test("Load songs with empty array keeps queue empty")
    @MainActor
    func testLoadEmptySongs() async throws {
        let player = makeMockPlayer()
        
        try await player.loadSongs(ids: [])
        
        #expect(player.queue.isEmpty)
        #expect(player.currentTrack == nil)
    }
    
    @Test("Add to queue appends track")
    @MainActor
    func testAddToQueue() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1"])
        
        try await player.addToQueue(songId: "song2")
        
        #expect(player.queue.count == 2)
        #expect(player.addToQueueCallCount == 1)
        #expect(player.lastAddedSongId == "song2")
    }
    
    @Test("Clear queue removes all tracks")
    @MainActor
    func testClearQueue() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1", "song2"])
        
        try await player.clearQueue()
        
        #expect(player.queue.isEmpty)
        #expect(player.currentTrack == nil)
        #expect(player.state == .stopped)
        #expect(player.clearQueueCallCount == 1)
    }
    
    // MARK: - Navigation Tests
    
    @Test("Skip to next advances queue position")
    @MainActor
    func testSkipToNext() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1", "song2", "song3"])
        
        try await player.skipToNext()
        
        #expect(player.queuePosition == 1)
        #expect(player.currentTrack?.id == "song2")
        #expect(player.skipToNextCallCount == 1)
    }
    
    @Test("Skip to next at end of queue stays at last track")
    @MainActor
    func testSkipToNextAtEnd() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1", "song2"])
        try await player.skipToNext() // Now at song2
        
        try await player.skipToNext() // Already at end
        
        #expect(player.queuePosition == 1)
        #expect(player.currentTrack?.id == "song2")
    }
    
    @Test("Skip to previous moves back in queue")
    @MainActor
    func testSkipToPrevious() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1", "song2", "song3"])
        try await player.skipToNext()
        try await player.skipToNext()
        
        try await player.skipToPrevious()
        
        #expect(player.queuePosition == 1)
        #expect(player.currentTrack?.id == "song2")
        #expect(player.skipToPreviousCallCount == 1)
    }
    
    @Test("Skip to previous at start stays at first track")
    @MainActor
    func testSkipToPreviousAtStart() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1", "song2"])
        
        try await player.skipToPrevious()
        
        #expect(player.queuePosition == 0)
        #expect(player.currentTrack?.id == "song1")
    }
    
    @Test("Skip to specific index jumps to track")
    @MainActor
    func testSkipToIndex() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1", "song2", "song3"])
        
        try await player.skipTo(index: 2)
        
        #expect(player.queuePosition == 2)
        #expect(player.currentTrack?.id == "song3")
        #expect(player.skipToCallCount == 1)
        #expect(player.lastSkipToIndex == 2)
    }
    
    @Test("Skip to invalid index is handled gracefully")
    @MainActor
    func testSkipToInvalidIndex() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1", "song2"])
        
        try await player.skipTo(index: 10) // Out of bounds
        
        // Should stay at current position
        #expect(player.queuePosition == 0)
    }
    
    // MARK: - Seek Tests
    
    @Test("Seek updates current time")
    @MainActor
    func testSeek() async throws {
        let player = makeMockPlayer()
        try await player.loadSongs(ids: ["song1"])
        
        try await player.seek(to: 60.0)
        
        #expect(player.currentTime == 60.0)
        #expect(player.seekCallCount == 1)
        #expect(player.lastSeekTime == 60.0)
    }
    
    // MARK: - Error Handling Tests
    
    @Test("Play error is thrown correctly")
    @MainActor
    func testPlayError() async {
        let player = makeMockPlayer()
        player.playError = APIError.serverError
        
        await #expect(throws: APIError.self) {
            try await player.play()
        }
    }
    
    @Test("Load songs error is thrown correctly")
    @MainActor
    func testLoadSongsError() async {
        let player = makeMockPlayer()
        player.loadSongsError = APIError.notFound
        
        await #expect(throws: APIError.self) {
            try await player.loadSongs(ids: ["song1"])
        }
    }
}
