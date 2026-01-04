import Foundation
@testable import Lastream

/// Mock implementation of StationAPIProtocol for testing.
final class MockStationAPI: StationAPIProtocol, @unchecked Sendable {
    var getStationResult: Result<Station, Error> = .failure(APIError.notFound)
    var createArtistStationResult: Result<Station, Error> = .failure(APIError.serverError)
    var createSimilarArtistsStationResult: Result<Station, Error> = .failure(APIError.serverError)
    var createTagStationResult: Result<Station, Error> = .failure(APIError.serverError)
    var createLastfmLibraryStationResult: Result<Station, Error> = .failure(APIError.serverError)
    var topUpStationError: Error?
    var deleteSongsError: Error?
    
    var getStationCallCount = 0
    var createArtistStationCallCount = 0
    var createSimilarArtistsStationCallCount = 0
    var createTagStationCallCount = 0
    var createLastfmLibraryStationCallCount = 0
    var topUpStationCallCount = 0
    var deleteSongsCallCount = 0
    
    var lastStationId: String?
    var lastArtistIds: [String]?
    var lastArtistName: String?
    var lastTag: String?
    var lastTopUpParams: (id: String, type: StationType, count: Int)?
    var lastDeleteParams: (stationId: String, position: Int, count: Int)?
    
    func getStation(id: String) async throws -> Station {
        getStationCallCount += 1
        lastStationId = id
        return try getStationResult.get()
    }
    
    func createArtistStation(artistIds: [String]) async throws -> Station {
        createArtistStationCallCount += 1
        lastArtistIds = artistIds
        return try createArtistStationResult.get()
    }
    
    func createSimilarArtistsStation(artistName: String) async throws -> Station {
        createSimilarArtistsStationCallCount += 1
        lastArtistName = artistName
        return try createSimilarArtistsStationResult.get()
    }
    
    func createTagStation(tag: String) async throws -> Station {
        createTagStationCallCount += 1
        lastTag = tag
        return try createTagStationResult.get()
    }
    
    func createLastfmLibraryStation() async throws -> Station {
        createLastfmLibraryStationCallCount += 1
        return try createLastfmLibraryStationResult.get()
    }
    
    func topUpStation(id: String, type: StationType, count: Int) async throws {
        topUpStationCallCount += 1
        lastTopUpParams = (id, type, count)
        if let error = topUpStationError {
            throw error
        }
    }
    
    func deleteSongs(stationId: String, position: Int, count: Int) async throws {
        deleteSongsCallCount += 1
        lastDeleteParams = (stationId, position, count)
        if let error = deleteSongsError {
            throw error
        }
    }
    
    func reset() {
        getStationCallCount = 0
        createArtistStationCallCount = 0
        createSimilarArtistsStationCallCount = 0
        createTagStationCallCount = 0
        createLastfmLibraryStationCallCount = 0
        topUpStationCallCount = 0
        deleteSongsCallCount = 0
        lastStationId = nil
        lastArtistIds = nil
        lastArtistName = nil
        lastTag = nil
        lastTopUpParams = nil
        lastDeleteParams = nil
    }
    
    // Helper to create a mock station
    static func mockStation(
        id: String = UUID().uuidString,
        songIds: [String] = ["song1", "song2", "song3"],
        isContinuous: Bool = false,
        isGroupedByAlbum: Bool = false,
        type: String = "artist"
    ) -> Station {
        Station(
            id: id,
            songIds: songIds,
            isContinuous: isContinuous,
            isGroupedByAlbum: isGroupedByAlbum,
            size: songIds.count,
            definition: StationDefinition(stationType: type)
        )
    }
}
