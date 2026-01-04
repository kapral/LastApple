import Foundation

/// Protocol for Apple Music authentication API operations.
protocol AppleAuthAPIProtocol: Sendable {
    /// Gets the developer token for MusicKit configuration.
    func getDeveloperToken() async throws -> String
    
    /// Gets the current session data.
    func getSessionData() async throws -> Session
    
    /// Saves Apple Music session data to the backend.
    func postSessionData(_ data: AppleMusicSessionData) async throws -> Session
    
    /// Deletes Apple Music session data (logout).
    func deleteSessionData() async throws
}

/// Implementation of the Apple Music authentication API.
final class AppleAuthAPI: AppleAuthAPIProtocol, Sendable {
    private let client: APIClientProtocol
    
    init(client: APIClientProtocol) {
        self.client = client
    }
    
    func getDeveloperToken() async throws -> String {
        try await client.getString("api/apple/auth/developertoken")
    }
    
    func getSessionData() async throws -> Session {
        try await client.get("api/apple/auth/sessiondata")
    }
    
    func postSessionData(_ data: AppleMusicSessionData) async throws -> Session {
        try await client.post("api/apple/auth/sessiondata", body: data)
    }
    
    func deleteSessionData() async throws {
        try await client.delete("api/apple/auth/sessiondata")
    }
}
