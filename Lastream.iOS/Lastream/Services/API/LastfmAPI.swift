import Foundation

/// Protocol for Last.fm API operations.
protocol LastfmAPIProtocol: Sendable {
    /// Gets the Last.fm OAuth authorization URL.
    func getAuthUrl(redirectUrl: String) async throws -> URL
    
    /// Completes the OAuth flow by posting the authorization token.
    func postToken(_ token: String) async throws -> String
    
    /// Logs out from Last.fm.
    func logout() async throws
    
    /// Gets the authenticated Last.fm user.
    func getUser() async throws -> LastfmUser?
    
    /// Searches for artists by name.
    func searchArtist(term: String) async throws -> [LastfmArtist]
    
    /// Searches for tags by name.
    func searchTag(term: String) async throws -> [LastfmTag]
    
    /// Scrobbles a track to Last.fm.
    func scrobble(song: String, artist: String, album: String?, timestamp: Date?) async throws
    
    /// Updates the "now playing" status on Last.fm.
    func updateNowPlaying(song: String, artist: String, album: String?) async throws
}

/// Request body for scrobble and now playing endpoints.
struct ScrobbleRequest: Codable, Sendable {
    let artist: String
    let song: String
    let album: String?
    let timestamp: Int?
    
    init(artist: String, song: String, album: String? = nil, timestamp: Date? = nil) {
        self.artist = artist
        self.song = song
        self.album = album
        self.timestamp = timestamp.map { Int($0.timeIntervalSince1970) }
    }
}

/// Implementation of the Last.fm API.
final class LastfmAPI: LastfmAPIProtocol, Sendable {
    private let client: APIClientProtocol
    
    init(client: APIClientProtocol) {
        self.client = client
    }
    
    func getAuthUrl(redirectUrl: String) async throws -> URL {
        let encodedUrl = redirectUrl.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? redirectUrl
        let urlString: String = try await client.getString("api/lastfm/auth?redirectUrl=\(encodedUrl)")
        
        guard let url = URL(string: urlString) else {
            throw APIError.invalidResponse
        }
        return url
    }
    
    func postToken(_ token: String) async throws -> String {
        try await client.post("api/lastfm/auth?token=\(token)")
    }
    
    func logout() async throws {
        try await client.delete("api/lastfm/auth")
    }
    
    func getUser() async throws -> LastfmUser? {
        do {
            return try await client.get("api/lastfm/auth/user")
        } catch APIError.notFound {
            return nil
        } catch {
            // If we get an empty response or null, return nil
            return nil
        }
    }
    
    func searchArtist(term: String) async throws -> [LastfmArtist] {
        let encodedTerm = term.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? term
        return try await client.get("api/lastfm/artist/search?term=\(encodedTerm)")
    }
    
    func searchTag(term: String) async throws -> [LastfmTag] {
        let encodedTerm = term.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? term
        return try await client.get("api/lastfm/tag/search?term=\(encodedTerm)")
    }
    
    func scrobble(song: String, artist: String, album: String?, timestamp: Date?) async throws {
        let request = ScrobbleRequest(artist: artist, song: song, album: album, timestamp: timestamp)
        try await client.post("api/lastfm/scrobble", body: request) as EmptyResponse
    }
    
    func updateNowPlaying(song: String, artist: String, album: String?) async throws {
        let request = ScrobbleRequest(artist: artist, song: song, album: album)
        try await client.post("api/lastfm/nowplaying", body: request) as EmptyResponse
    }
}

/// Empty response type for endpoints that don't return data.
private struct EmptyResponse: Decodable {}
