import Foundation
import MusicKit

/// Protocol for abstracting MusicKit authorization.
///
/// This allows us to mock MusicKit for testing purposes.
protocol MusicAuthorizationProviding: Sendable {
    /// The current authorization status.
    var currentStatus: MusicAuthorization.Status { get }
    
    /// Requests authorization from the user.
    func requestAuthorization() async -> MusicAuthorization.Status
    
    /// Gets the current user's music token.
    func getUserToken() async throws -> String
    
    /// Gets the current user's storefront/country code.
    func getCountryCode() async throws -> String
}

/// Default implementation using actual MusicKit.
final class MusicKitProvider: MusicAuthorizationProviding, Sendable {
    var currentStatus: MusicAuthorization.Status {
        MusicAuthorization.currentStatus
    }
    
    func requestAuthorization() async -> MusicAuthorization.Status {
        await MusicAuthorization.request()
    }
    
    func getUserToken() async throws -> String {
        try await MusicUserTokenHelper.current()
    }
    
    func getCountryCode() async throws -> String {
        try await MusicDataRequest.currentCountryCode
    }
}
