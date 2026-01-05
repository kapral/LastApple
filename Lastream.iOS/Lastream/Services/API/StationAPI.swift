import Foundation

/// Protocol for station-related API operations.
protocol StationAPIProtocol: Sendable {
    /// Gets a station by ID.
    func getStation(id: String) async throws -> Station
    
    /// Creates a station for one or more artists.
    func createArtistStation(artistIds: [String]) async throws -> Station
    
    /// Creates a station based on similar artists.
    func createSimilarArtistsStation(artistName: String) async throws -> Station
    
    /// Creates a station based on a tag/genre.
    func createTagStation(tag: String) async throws -> Station
    
    /// Creates a station from the user's Last.fm library.
    func createLastfmLibraryStation() async throws -> Station
    
    /// Tops up a station with more tracks.
    func topUpStation(id: String, type: StationType, count: Int) async throws
    
    /// Deletes songs from a station.
    func deleteSongs(stationId: String, position: Int, count: Int) async throws
}

/// Implementation of the Station API.
final class StationAPI: StationAPIProtocol, Sendable {
    private let client: APIClientProtocol
    
    init(client: APIClientProtocol) {
        self.client = client
    }
    
    func getStation(id: String) async throws -> Station {
        try await client.get("api/station/\(id)")
    }
    
    func createArtistStation(artistIds: [String]) async throws -> Station {
        let joinedIds = artistIds.joined(separator: ",")
        return try await client.post("api/station/artist/\(joinedIds)")
    }
    
    func createSimilarArtistsStation(artistName: String) async throws -> Station {
        let encodedName = artistName.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? artistName
        return try await client.post("api/station/similarartists/\(encodedName)")
    }
    
    func createTagStation(tag: String) async throws -> Station {
        let encodedTag = tag.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? tag
        return try await client.post("api/station/tags/\(encodedTag)")
    }
    
    func createLastfmLibraryStation() async throws -> Station {
        try await client.post("api/station/lastfmlibrary/my")
    }
    
    func topUpStation(id: String, type: StationType, count: Int) async throws {
        try await client.post("api/station/\(type.rawValue)/\(id)/topup/\(count)")
    }
    
    func deleteSongs(stationId: String, position: Int, count: Int) async throws {
        let queryItems = [
            URLQueryItem(name: "position", value: String(position)),
            URLQueryItem(name: "count", value: String(count))
        ]
        try await client.delete("api/station/\(stationId)/songs", queryItems: queryItems)
    }
}
