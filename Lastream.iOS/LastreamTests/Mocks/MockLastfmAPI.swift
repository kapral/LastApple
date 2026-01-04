import Foundation
@testable import Lastream

/// Mock implementation of LastfmAPIProtocol for testing.
final class MockLastfmAPI: LastfmAPIProtocol, @unchecked Sendable {
    var getAuthUrlResult: Result<URL, Error> = .success(URL(string: "https://last.fm/auth")!)
    var postTokenResult: Result<String, Error> = .success("mock-session-id")
    var logoutError: Error?
    var getUserResult: Result<LastfmUser?, Error> = .success(nil)
    var searchArtistResult: Result<[LastfmArtist], Error> = .success([])
    var searchTagResult: Result<[LastfmTag], Error> = .success([])
    var scrobbleError: Error?
    var updateNowPlayingError: Error?
    
    var getAuthUrlCallCount = 0
    var postTokenCallCount = 0
    var logoutCallCount = 0
    var getUserCallCount = 0
    var searchArtistCallCount = 0
    var searchTagCallCount = 0
    var scrobbleCallCount = 0
    var updateNowPlayingCallCount = 0
    
    var lastRedirectUrl: String?
    var lastToken: String?
    var lastArtistSearchTerm: String?
    var lastTagSearchTerm: String?
    var lastScrobble: (song: String, artist: String, album: String?, timestamp: Date?)?
    var lastNowPlaying: (song: String, artist: String, album: String?)?
    
    func getAuthUrl(redirectUrl: String) async throws -> URL {
        getAuthUrlCallCount += 1
        lastRedirectUrl = redirectUrl
        return try getAuthUrlResult.get()
    }
    
    func postToken(_ token: String) async throws -> String {
        postTokenCallCount += 1
        lastToken = token
        return try postTokenResult.get()
    }
    
    func logout() async throws {
        logoutCallCount += 1
        if let error = logoutError {
            throw error
        }
    }
    
    func getUser() async throws -> LastfmUser? {
        getUserCallCount += 1
        return try getUserResult.get()
    }
    
    func searchArtist(term: String) async throws -> [LastfmArtist] {
        searchArtistCallCount += 1
        lastArtistSearchTerm = term
        return try searchArtistResult.get()
    }
    
    func searchTag(term: String) async throws -> [LastfmTag] {
        searchTagCallCount += 1
        lastTagSearchTerm = term
        return try searchTagResult.get()
    }
    
    func scrobble(song: String, artist: String, album: String?, timestamp: Date?) async throws {
        scrobbleCallCount += 1
        lastScrobble = (song, artist, album, timestamp)
        if let error = scrobbleError {
            throw error
        }
    }
    
    func updateNowPlaying(song: String, artist: String, album: String?) async throws {
        updateNowPlayingCallCount += 1
        lastNowPlaying = (song, artist, album)
        if let error = updateNowPlayingError {
            throw error
        }
    }
    
    func reset() {
        getAuthUrlCallCount = 0
        postTokenCallCount = 0
        logoutCallCount = 0
        getUserCallCount = 0
        searchArtistCallCount = 0
        searchTagCallCount = 0
        scrobbleCallCount = 0
        updateNowPlayingCallCount = 0
        lastRedirectUrl = nil
        lastToken = nil
        lastArtistSearchTerm = nil
        lastTagSearchTerm = nil
        lastScrobble = nil
        lastNowPlaying = nil
        getAuthUrlResult = .success(URL(string: "https://last.fm/auth")!)
        postTokenResult = .success("mock-session-id")
        logoutError = nil
        getUserResult = .success(nil)
        searchArtistResult = .success([])
        searchTagResult = .success([])
        scrobbleError = nil
        updateNowPlayingError = nil
    }
}
