import Foundation

/// Represents a user session with the Lastream backend.
struct Session: Codable, Sendable {
    /// Unique identifier for the session.
    let id: UUID?
    
    /// When the session was started.
    let startedAt: Date?
    
    /// When the session was last active.
    let lastActivityAt: Date?
    
    /// Last.fm session key for authenticated requests.
    let lastfmSessionKey: String?
    
    /// Last.fm username.
    let lastfmUsername: String?
    
    /// Apple Music user token.
    let musicUserToken: String?
    
    /// Apple Music storefront ID (country code).
    let musicStorefrontId: String?
    
    /// Whether the session has valid Apple Music credentials.
    var hasAppleMusicAuth: Bool {
        musicUserToken != nil && musicStorefrontId != nil
    }
    
    /// Whether the session has valid Last.fm credentials.
    var hasLastfmAuth: Bool {
        lastfmSessionKey != nil
    }
}

/// Data sent to the backend when authorizing with Apple Music.
struct AppleMusicSessionData: Codable, Sendable {
    /// The user's Apple Music token.
    let musicUserToken: String
    
    /// The user's Apple Music storefront ID.
    let musicStorefrontId: String
}
