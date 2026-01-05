import Testing
import Foundation
@testable import Lastream

/// Tests for StationPlayerViewModel behavior.
@Suite("StationPlayerViewModel Tests")
@MainActor
struct StationPlayerViewModelTests {
    
    // MARK: - Helper Functions
    
    private func makeTestStation(
        id: String = "test-station",
        songIds: [String] = ["song1", "song2", "song3"],
        isContinuous: Bool = false
    ) -> Station {
        Station(
            id: id,
            songIds: songIds,
            isContinuous: isContinuous,
            isGroupedByAlbum: false,
            size: songIds.count,
            definition: StationDefinition(stationType: "artist")
        )
    }
    
    private func makeViewModel(
        stationId: String = "test-station",
        stationAPI: MockStationAPI = MockStationAPI(),
        player: MockMusicPlayerService = MockMusicPlayerService()
    ) -> StationPlayerViewModel {
        StationPlayerViewModel(
            stationId: stationId,
            stationAPI: stationAPI,
            player: player
        )
    }
    
    // MARK: - Loading Tests
    
    @Test("Initial state is loading")
    func testInitialState() async {
        let viewModel = makeViewModel()
        
        #expect(viewModel.isLoading == true)
        #expect(viewModel.error == nil)
        #expect(viewModel.station == nil)
    }
    
    @Test("Load station fetches and plays station")
    func testLoadStation() async {
        let stationAPI = MockStationAPI()
        let player = MockMusicPlayerService()
        let station = makeTestStation()
        stationAPI.getStationResult = .success(station)
        
        let viewModel = makeViewModel(stationAPI: stationAPI, player: player)
        
        await viewModel.loadStation()
        
        #expect(viewModel.isLoading == false)
        #expect(viewModel.error == nil)
        #expect(viewModel.station?.id == "test-station")
        #expect(stationAPI.getStationCallCount == 1)
        #expect(player.loadSongsCallCount == 1)
        #expect(player.playCallCount == 1)
    }
    
    @Test("Load station error sets error message")
    func testLoadStationError() async {
        let stationAPI = MockStationAPI()
        stationAPI.getStationResult = .failure(APIError.notFound)
        
        let viewModel = makeViewModel(stationAPI: stationAPI)
        
        await viewModel.loadStation()
        
        #expect(viewModel.isLoading == false)
        #expect(viewModel.error != nil)
        #expect(viewModel.station == nil)
    }
    
    // MARK: - Playback Control Tests
    
    @Test("Toggle play pause calls player")
    func testTogglePlayPause() async throws {
        let stationAPI = MockStationAPI()
        let player = MockMusicPlayerService()
        stationAPI.getStationResult = .success(makeTestStation())
        
        let viewModel = makeViewModel(stationAPI: stationAPI, player: player)
        await viewModel.loadStation()
        
        await viewModel.togglePlayPause()
        
        #expect(player.togglePlayPauseCallCount == 1)
    }
    
    @Test("Skip to next calls player and syncs state")
    func testSkipToNext() async throws {
        let stationAPI = MockStationAPI()
        let player = MockMusicPlayerService()
        stationAPI.getStationResult = .success(makeTestStation())
        
        let viewModel = makeViewModel(stationAPI: stationAPI, player: player)
        await viewModel.loadStation()
        
        await viewModel.skipToNext()
        
        #expect(player.skipToNextCallCount == 1)
    }
    
    @Test("Skip to previous calls player")
    func testSkipToPrevious() async throws {
        let stationAPI = MockStationAPI()
        let player = MockMusicPlayerService()
        stationAPI.getStationResult = .success(makeTestStation())
        
        let viewModel = makeViewModel(stationAPI: stationAPI, player: player)
        await viewModel.loadStation()
        
        await viewModel.skipToPrevious()
        
        #expect(player.skipToPreviousCallCount == 1)
    }
    
    @Test("Seek calls player with time")
    func testSeek() async throws {
        let stationAPI = MockStationAPI()
        let player = MockMusicPlayerService()
        stationAPI.getStationResult = .success(makeTestStation())
        
        let viewModel = makeViewModel(stationAPI: stationAPI, player: player)
        await viewModel.loadStation()
        
        await viewModel.seek(to: 60.0)
        
        #expect(player.seekCallCount == 1)
        #expect(player.lastSeekTime == 60.0)
    }
    
    @Test("Skip to index calls player")
    func testSkipToIndex() async throws {
        let stationAPI = MockStationAPI()
        let player = MockMusicPlayerService()
        stationAPI.getStationResult = .success(makeTestStation())
        
        let viewModel = makeViewModel(stationAPI: stationAPI, player: player)
        await viewModel.loadStation()
        
        await viewModel.skipTo(index: 2)
        
        #expect(player.skipToCallCount == 1)
        #expect(player.lastSkipToIndex == 2)
    }
    
    // MARK: - Error Handling Tests
    
    @Test("Playback error sets error message")
    func testPlaybackError() async {
        let stationAPI = MockStationAPI()
        let player = MockMusicPlayerService()
        stationAPI.getStationResult = .success(makeTestStation())
        player.togglePlayPauseError = APIError.serverError
        
        let viewModel = makeViewModel(stationAPI: stationAPI, player: player)
        await viewModel.loadStation()
        
        await viewModel.togglePlayPause()
        
        #expect(viewModel.error != nil)
    }
}
