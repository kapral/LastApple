import Foundation

/// Environment configuration for the Lastream app.
///
/// Provides API URLs and other environment-specific configuration.
/// Uses the same base URL as the web frontend.
enum AppEnvironment {
    /// The base URL for the Lastream API.
    /// In production, this points to the Azure-hosted backend.
    static let apiURL: URL = {
        #if DEBUG
        // Use the same production API for now
        // Can be changed to localhost for local development
        return URL(string: "https://lastream.azurewebsites.net/")!
        #else
        return URL(string: "https://lastream.azurewebsites.net/")!
        #endif
    }()
    
    /// The SignalR hub URL for real-time station updates.
    static var hubURL: URL {
        apiURL.appendingPathComponent("hubs")
    }
    
    /// The URL scheme for OAuth callbacks.
    static let urlScheme = "lastream"
    
    /// The callback URL for Last.fm OAuth authentication.
    static var lastfmCallbackURL: String {
        "\(urlScheme)://lastfm-callback"
    }
}
