import Foundation
import MusicKit
@testable import Lastream

/// Mock implementation of CatalogSearching for testing.
final class MockCatalogSearchService: CatalogSearching, @unchecked Sendable {
    var searchArtistsResult: Result<[CatalogArtist], Error> = .success([])
    var searchSongsResult: Result<[Song], Error> = .success([])
    var getSongResult: Result<Song?, Error> = .success(nil)
    var getSongsResult: Result<[Song], Error> = .success([])
    
    var searchArtistsCallCount = 0
    var searchSongsCallCount = 0
    var getSongCallCount = 0
    var getSongsCallCount = 0
    
    var lastSearchArtistsTerm: String?
    var lastSearchSongsTerm: String?
    var lastGetSongId: String?
    var lastGetSongsIds: [String]?
    
    func searchArtists(term: String) async throws -> [CatalogArtist] {
        searchArtistsCallCount += 1
        lastSearchArtistsTerm = term
        return try searchArtistsResult.get()
    }
    
    func searchSongs(term: String) async throws -> [Song] {
        searchSongsCallCount += 1
        lastSearchSongsTerm = term
        return try searchSongsResult.get()
    }
    
    func getSong(id: String) async throws -> Song? {
        getSongCallCount += 1
        lastGetSongId = id
        return try getSongResult.get()
    }
    
    func getSongs(ids: [String]) async throws -> [Song] {
        getSongsCallCount += 1
        lastGetSongsIds = ids
        return try getSongsResult.get()
    }
    
    func reset() {
        searchArtistsResult = .success([])
        searchSongsResult = .success([])
        getSongResult = .success(nil)
        getSongsResult = .success([])
        searchArtistsCallCount = 0
        searchSongsCallCount = 0
        getSongCallCount = 0
        getSongsCallCount = 0
        lastSearchArtistsTerm = nil
        lastSearchSongsTerm = nil
        lastGetSongId = nil
        lastGetSongsIds = nil
    }
    
    // MARK: - Test Helpers
    
    static func mockArtist(id: String = "artist-1", name: String = "Test Artist") -> CatalogArtist {
        CatalogArtist(id: id, name: name, artworkURL: nil)
    }
    
    static func mockArtists(count: Int = 3) -> [CatalogArtist] {
        (1...count).map { mockArtist(id: "artist-\($0)", name: "Artist \($0)") }
    }
}
