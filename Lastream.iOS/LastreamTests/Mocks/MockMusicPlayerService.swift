import Foundation
@testable import Lastream

/// Mock implementation of MusicPlayerProtocol for testing.
@MainActor
final class MockMusicPlayerService: MusicPlayerProtocol {
    // MARK: - State
    
    var state: PlaybackState = .stopped
    var currentTrack: QueueTrack?
    var queue: [QueueTrack] = []
    var currentTime: TimeInterval = 0
    var duration: TimeInterval = 0
    var queuePosition: Int = 0
    
    // MARK: - Control Results
    
    var playError: Error?
    var togglePlayPauseError: Error?
    var skipToNextError: Error?
    var skipToPreviousError: Error?
    var seekError: Error?
    var skipToError: Error?
    var loadSongsError: Error?
    var addToQueueError: Error?
    var clearQueueError: Error?
    
    // MARK: - Call Tracking
    
    var playCallCount = 0
    var pauseCallCount = 0
    var togglePlayPauseCallCount = 0
    var skipToNextCallCount = 0
    var skipToPreviousCallCount = 0
    var seekCallCount = 0
    var skipToCallCount = 0
    var loadSongsCallCount = 0
    var addToQueueCallCount = 0
    var clearQueueCallCount = 0
    
    var lastSeekTime: TimeInterval?
    var lastSkipToIndex: Int?
    var lastLoadedSongIds: [String]?
    var lastAddedSongId: String?
    
    // MARK: - MusicPlayerProtocol
    
    func play() async throws {
        playCallCount += 1
        if let error = playError {
            throw error
        }
        state = .playing
    }
    
    func pause() {
        pauseCallCount += 1
        state = .paused
    }
    
    func togglePlayPause() async throws {
        togglePlayPauseCallCount += 1
        if let error = togglePlayPauseError {
            throw error
        }
        state = state == .playing ? .paused : .playing
    }
    
    func skipToNext() async throws {
        skipToNextCallCount += 1
        if let error = skipToNextError {
            throw error
        }
        if queuePosition < queue.count - 1 {
            queuePosition += 1
            currentTrack = queue[queuePosition]
        }
    }
    
    func skipToPrevious() async throws {
        skipToPreviousCallCount += 1
        if let error = skipToPreviousError {
            throw error
        }
        if queuePosition > 0 {
            queuePosition -= 1
            currentTrack = queue[queuePosition]
        }
    }
    
    func seek(to time: TimeInterval) async throws {
        seekCallCount += 1
        lastSeekTime = time
        if let error = seekError {
            throw error
        }
        currentTime = time
    }
    
    func skipTo(index: Int) async throws {
        skipToCallCount += 1
        lastSkipToIndex = index
        if let error = skipToError {
            throw error
        }
        if index >= 0 && index < queue.count {
            queuePosition = index
            currentTrack = queue[index]
        }
    }
    
    func loadSongs(ids: [String]) async throws {
        loadSongsCallCount += 1
        lastLoadedSongIds = ids
        if let error = loadSongsError {
            throw error
        }
        // Create mock queue tracks
        queue = ids.enumerated().map { index, id in
            QueueTrack(
                id: id,
                title: "Track \(index + 1)",
                artistName: "Artist",
                albumName: "Album",
                duration: 180
            )
        }
        if let first = queue.first {
            currentTrack = first
            duration = first.duration
        }
        queuePosition = 0
    }
    
    func addToQueue(songId: String) async throws {
        addToQueueCallCount += 1
        lastAddedSongId = songId
        if let error = addToQueueError {
            throw error
        }
        let track = QueueTrack(
            id: songId,
            title: "New Track",
            artistName: "Artist",
            albumName: "Album",
            duration: 180
        )
        queue.append(track)
    }
    
    func clearQueue() async throws {
        clearQueueCallCount += 1
        if let error = clearQueueError {
            throw error
        }
        queue = []
        currentTrack = nil
        queuePosition = 0
        currentTime = 0
        duration = 0
        state = .stopped
    }
    
    // MARK: - Test Helpers
    
    func reset() {
        state = .stopped
        currentTrack = nil
        queue = []
        currentTime = 0
        duration = 0
        queuePosition = 0
        
        playError = nil
        togglePlayPauseError = nil
        skipToNextError = nil
        skipToPreviousError = nil
        seekError = nil
        skipToError = nil
        loadSongsError = nil
        addToQueueError = nil
        clearQueueError = nil
        
        playCallCount = 0
        pauseCallCount = 0
        togglePlayPauseCallCount = 0
        skipToNextCallCount = 0
        skipToPreviousCallCount = 0
        seekCallCount = 0
        skipToCallCount = 0
        loadSongsCallCount = 0
        addToQueueCallCount = 0
        clearQueueCallCount = 0
        
        lastSeekTime = nil
        lastSkipToIndex = nil
        lastLoadedSongIds = nil
        lastAddedSongId = nil
    }
}
