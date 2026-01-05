import Foundation
import MusicKit

/// Represents an artist from the Apple Music catalog.
struct CatalogArtist: Identifiable, Sendable, Equatable {
    let id: String
    let name: String
    let artworkURL: URL?
    
    init(id: String, name: String, artworkURL: URL? = nil) {
        self.id = id
        self.name = name
        self.artworkURL = artworkURL
    }
    
    init(from artist: Artist) {
        self.id = artist.id.rawValue
        self.name = artist.name
        self.artworkURL = artist.artwork?.url(width: 100, height: 100)
    }
}

/// Service for searching the Apple Music catalog.
actor CatalogSearchService {
    /// Shared instance.
    static let shared = CatalogSearchService()
    
    private init() {}
    
    /// Searches for artists in the Apple Music catalog.
    /// - Parameter term: The search term.
    /// - Returns: An array of matching artists.
    func searchArtists(term: String) async throws -> [CatalogArtist] {
        var request = MusicCatalogSearchRequest(term: term, types: [Artist.self])
        request.limit = 10
        
        let response = try await request.response()
        
        return response.artists.map { CatalogArtist(from: $0) }
    }
    
    /// Searches for songs in the Apple Music catalog.
    /// - Parameter term: The search term.
    /// - Returns: An array of matching songs.
    func searchSongs(term: String) async throws -> [Song] {
        var request = MusicCatalogSearchRequest(term: term, types: [Song.self])
        request.limit = 25
        
        let response = try await request.response()
        
        return Array(response.songs)
    }
    
    /// Gets song details by ID.
    /// - Parameter id: The song ID.
    /// - Returns: The song details.
    func getSong(id: String) async throws -> Song? {
        let request = MusicCatalogResourceRequest<Song>(matching: \.id, equalTo: MusicItemID(id))
        let response = try await request.response()
        return response.items.first
    }
    
    /// Gets multiple songs by IDs.
    /// - Parameter ids: The song IDs.
    /// - Returns: An array of songs.
    func getSongs(ids: [String]) async throws -> [Song] {
        let musicIds = ids.map { MusicItemID($0) }
        let request = MusicCatalogResourceRequest<Song>(matching: \.id, memberOf: musicIds)
        let response = try await request.response()
        return Array(response.items)
    }
}

// MARK: - Protocol for Dependency Injection

/// Protocol for catalog search operations.
protocol CatalogSearching: Sendable {
    /// Searches for artists in the catalog.
    func searchArtists(term: String) async throws -> [CatalogArtist]
    
    /// Searches for songs in the catalog.
    func searchSongs(term: String) async throws -> [Song]
    
    /// Gets a song by ID.
    func getSong(id: String) async throws -> Song?
    
    /// Gets multiple songs by IDs.
    func getSongs(ids: [String]) async throws -> [Song]
}

extension CatalogSearchService: CatalogSearching {}
