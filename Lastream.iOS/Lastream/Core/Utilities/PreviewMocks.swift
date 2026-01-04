import Foundation

#if DEBUG
/// Preview-specific mock for AppleAuthAPI
final class PreviewAppleAuthAPI: AppleAuthAPIProtocol, @unchecked Sendable {
    func getDeveloperToken() async throws -> String { "preview-token" }
    func getSessionData() async throws -> Session { 
        Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: nil,
            musicStorefrontId: nil
        )
    }
    func postSessionData(_ data: AppleMusicSessionData) async throws -> Session {
        Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: data.musicUserToken,
            musicStorefrontId: data.musicStorefrontId
        )
    }
    func deleteSessionData() async throws {}
}

/// Preview-specific mock for LastfmAPI
final class PreviewLastfmAPI: LastfmAPIProtocol, @unchecked Sendable {
    func getAuthUrl(redirectUrl: String) async throws -> URL {
        URL(string: "https://last.fm/auth")!
    }
    func postToken(_ token: String) async throws -> String { "session-key" }
    func logout() async throws {}
    func getUser() async throws -> LastfmUser? { nil }
    func searchArtist(term: String) async throws -> [LastfmArtist] { [] }
    func searchTag(term: String) async throws -> [LastfmTag] { [] }
    func scrobble(song: String, artist: String, album: String?, timestamp: Date?) async throws {}
    func updateNowPlaying(song: String, artist: String, album: String?) async throws {}
}

/// Preview helpers for creating service instances
@MainActor
enum PreviewHelpers {
    static func makeAppleMusicAuthService() -> AppleMusicAuthService {
        AppleMusicAuthService(api: PreviewAppleAuthAPI())
    }
    
    static func makeLastfmAuthService() -> LastfmAuthService {
        LastfmAuthService(api: PreviewLastfmAPI())
    }
}
#endif
