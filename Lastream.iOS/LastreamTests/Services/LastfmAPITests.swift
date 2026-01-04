import Testing
import Foundation
@testable import Lastream

/// Tests for the LastfmAPI.
@Suite("LastfmAPI Tests")
struct LastfmAPITests {
    
    @Test("getAuthUrl calls correct endpoint with redirect URL")
    func getAuthUrlEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        mockClient.getStringHandler = { endpoint in
            #expect(endpoint.contains("api/lastfm/auth"))
            #expect(endpoint.contains("redirectUrl="))
            return "https://last.fm/api/auth?api_key=xxx"
        }
        
        let url = try await api.getAuthUrl(redirectUrl: "lastream://callback")
        #expect(url.absoluteString.contains("last.fm"))
    }
    
    @Test("postToken calls correct endpoint")
    func postTokenEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        mockClient.postHandler = { endpoint, _ in
            #expect(endpoint.contains("api/lastfm/auth"))
            #expect(endpoint.contains("token=abc123"))
            return "session-id-123"
        }
        
        let sessionId = try await api.postToken("abc123")
        #expect(sessionId == "session-id-123")
    }
    
    @Test("logout calls correct endpoint")
    func logoutEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        mockClient.deleteHandler = { endpoint in
            #expect(endpoint == "api/lastfm/auth")
        }
        
        try await api.logout()
        #expect(mockClient.deleteCalls.count == 1)
    }
    
    @Test("getUser returns nil when not found")
    func getUserReturnsNilWhenNotFound() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        mockClient.getHandler = { _ in
            throw APIError.notFound
        }
        
        let user = try await api.getUser()
        #expect(user == nil)
    }
    
    @Test("searchArtist calls correct endpoint")
    func searchArtistEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        let artists = [
            LastfmArtist(name: "Radiohead", url: nil, listeners: "1000000")
        ]
        
        mockClient.getHandler = { endpoint in
            #expect(endpoint.contains("api/lastfm/artist/search"))
            #expect(endpoint.contains("term=radiohead"))
            return artists
        }
        
        let result = try await api.searchArtist(term: "radiohead")
        #expect(result.count == 1)
        #expect(result.first?.name == "Radiohead")
    }
    
    @Test("searchTag calls correct endpoint")
    func searchTagEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        let tags = [
            LastfmTag(name: "rock", count: 1000, url: nil)
        ]
        
        mockClient.getHandler = { endpoint in
            #expect(endpoint.contains("api/lastfm/tag/search"))
            #expect(endpoint.contains("term=rock"))
            return tags
        }
        
        let result = try await api.searchTag(term: "rock")
        #expect(result.count == 1)
        #expect(result.first?.name == "rock")
    }
    
    @Test("scrobble sends correct data")
    func scrobbleSendsCorrectData() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        mockClient.postHandler = { endpoint, body in
            #expect(endpoint == "api/lastfm/scrobble")
            if let request = body as? ScrobbleRequest {
                #expect(request.artist == "Radiohead")
                #expect(request.song == "Creep")
                #expect(request.album == "Pablo Honey")
            }
            return EmptyDecodable()
        }
        
        try await api.scrobble(
            song: "Creep",
            artist: "Radiohead",
            album: "Pablo Honey",
            timestamp: Date()
        )
        #expect(mockClient.postCalls.count == 1)
    }
    
    @Test("updateNowPlaying sends correct data")
    func updateNowPlayingSendsCorrectData() async throws {
        let mockClient = MockAPIClient()
        let api = LastfmAPI(client: mockClient)
        
        mockClient.postHandler = { endpoint, body in
            #expect(endpoint == "api/lastfm/nowplaying")
            if let request = body as? ScrobbleRequest {
                #expect(request.artist == "Radiohead")
                #expect(request.song == "Paranoid Android")
            }
            return EmptyDecodable()
        }
        
        try await api.updateNowPlaying(
            song: "Paranoid Android",
            artist: "Radiohead",
            album: nil
        )
        #expect(mockClient.postCalls.count == 1)
    }
}

// Helper for testing void responses
private struct EmptyDecodable: Decodable {}
