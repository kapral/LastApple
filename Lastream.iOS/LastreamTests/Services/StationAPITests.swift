import Testing
import Foundation
@testable import Lastream

/// Tests for the StationAPI.
@Suite("StationAPI Tests")
struct StationAPITests {
    
    @Test("getStation calls correct endpoint")
    func getStationEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = StationAPI(client: mockClient)
        
        let expectedStation = MockStationAPI.mockStation(id: "test-id")
        mockClient.getHandler = { endpoint in
            #expect(endpoint == "api/station/test-id")
            return expectedStation
        }
        
        let station = try await api.getStation(id: "test-id")
        #expect(station.id == "test-id")
        #expect(mockClient.getCalls.count == 1)
    }
    
    @Test("createArtistStation joins artist IDs")
    func createArtistStationJoinsIds() async throws {
        let mockClient = MockAPIClient()
        let api = StationAPI(client: mockClient)
        
        let expectedStation = MockStationAPI.mockStation()
        mockClient.postHandler = { endpoint, _ in
            #expect(endpoint == "api/station/artist/artist1,artist2,artist3")
            return expectedStation
        }
        
        let station = try await api.createArtistStation(artistIds: ["artist1", "artist2", "artist3"])
        #expect(station.songIds.count > 0)
        #expect(mockClient.postCalls.count == 1)
    }
    
    @Test("createSimilarArtistsStation encodes artist name")
    func createSimilarArtistsStationEncodesName() async throws {
        let mockClient = MockAPIClient()
        let api = StationAPI(client: mockClient)
        
        let expectedStation = MockStationAPI.mockStation()
        mockClient.postHandler = { endpoint, _ in
            #expect(endpoint.contains("api/station/similarartists/"))
            return expectedStation
        }
        
        _ = try await api.createSimilarArtistsStation(artistName: "The Beatles")
        #expect(mockClient.postCalls.count == 1)
    }
    
    @Test("createTagStation encodes tag")
    func createTagStationEncodesTag() async throws {
        let mockClient = MockAPIClient()
        let api = StationAPI(client: mockClient)
        
        let expectedStation = MockStationAPI.mockStation()
        mockClient.postHandler = { endpoint, _ in
            #expect(endpoint.contains("api/station/tags/"))
            return expectedStation
        }
        
        _ = try await api.createTagStation(tag: "indie rock")
        #expect(mockClient.postCalls.count == 1)
    }
    
    @Test("createLastfmLibraryStation calls correct endpoint")
    func createLastfmLibraryStationEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = StationAPI(client: mockClient)
        
        let expectedStation = MockStationAPI.mockStation()
        mockClient.postHandler = { endpoint, _ in
            #expect(endpoint == "api/station/lastfmlibrary/my")
            return expectedStation
        }
        
        _ = try await api.createLastfmLibraryStation()
        #expect(mockClient.postCalls.count == 1)
    }
    
    @Test("topUpStation calls correct endpoint with parameters")
    func topUpStationEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = StationAPI(client: mockClient)
        
        mockClient.postVoidHandler = { endpoint in
            #expect(endpoint == "api/station/artist/station-123/topup/10")
        }
        
        try await api.topUpStation(id: "station-123", type: .artist, count: 10)
        #expect(mockClient.postCalls.count == 1)
    }
    
    @Test("deleteSongs calls correct endpoint with query parameters")
    func deleteSongsEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = StationAPI(client: mockClient)
        
        mockClient.deleteWithQueryHandler = { endpoint, queryItems in
            #expect(endpoint == "api/station/station-123/songs")
            #expect(queryItems.contains { $0.name == "position" && $0.value == "5" })
            #expect(queryItems.contains { $0.name == "count" && $0.value == "3" })
        }
        
        try await api.deleteSongs(stationId: "station-123", position: 5, count: 3)
        #expect(mockClient.deleteCalls.count == 1)
    }
}
