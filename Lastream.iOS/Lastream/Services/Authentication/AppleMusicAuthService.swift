import Foundation
import MusicKit

/// Service for managing Apple Music authentication.
///
/// Handles MusicKit authorization and syncs the authorization state
/// with the Lastream backend.
@Observable
@MainActor
final class AppleMusicAuthService {
    /// The current authentication state.
    private(set) var state: AuthenticationState = .unknown
    
    private let api: AppleAuthAPIProtocol
    private let musicKitProvider: MusicAuthorizationProviding
    
    /// Creates a new Apple Music authentication service.
    /// - Parameters:
    ///   - api: The API client for backend communication.
    ///   - musicKitProvider: Provider for MusicKit operations (injectable for testing).
    init(api: AppleAuthAPIProtocol, musicKitProvider: MusicAuthorizationProviding = MusicKitProvider()) {
        self.api = api
        self.musicKitProvider = musicKitProvider
    }
    
    /// Checks the current MusicKit authorization status.
    func checkAuthorization() async {
        state = .loading
        
        let status = musicKitProvider.currentStatus
        
        switch status {
        case .authorized:
            state = .authenticated
        case .notDetermined:
            state = .unauthenticated
        default:
            state = .unauthenticated
        }
    }
    
    /// Requests MusicKit authorization and syncs with the backend.
    func authorize() async throws {
        state = .loading
        
        // Request MusicKit authorization
        let status = await musicKitProvider.requestAuthorization()
        
        guard status == .authorized else {
            state = .unauthenticated
            return
        }
        
        do {
            // Get user token for API requests
            let userToken = try await musicKitProvider.getUserToken()
            
            // Get the user's storefront (country code)
            let countryCode = try await musicKitProvider.getCountryCode()
            
            // Sync with backend
            let sessionData = AppleMusicSessionData(
                musicUserToken: userToken,
                musicStorefrontId: countryCode
            )
            
            let session = try await api.postSessionData(sessionData)
            
            // Store session ID for future API requests
            if let sessionId = session.id?.uuidString {
                UserDefaults.standard.set(sessionId, forKey: "SessionId")
            }
            
            state = .authenticated
        } catch {
            // If we fail to sync with backend, still mark as authenticated
            // since MusicKit is authorized locally
            state = .authenticated
            print("Failed to sync Apple Music auth with backend: \(error)")
        }
    }
    
    /// Revokes authorization and clears backend session data.
    func unauthorize() async throws {
        state = .loading
        
        do {
            try await api.deleteSessionData()
        } catch {
            print("Failed to clear Apple Music session from backend: \(error)")
        }
        
        state = .unauthenticated
    }
}

// MARK: - MusicDataRequest Extension

extension MusicDataRequest {
    /// Gets the current user's country code (storefront).
    static var currentCountryCode: String {
        get async throws {
            // Use the locale's region as a fallback
            let locale = Locale.current
            return locale.region?.identifier ?? "us"
        }
    }
}

// MARK: - Music User Token Helper

enum MusicUserTokenHelper {
    /// Gets the current user's music user token.
    static func current() async throws -> String {
        // In a real implementation, we would get this from MusicKit
        // For now, we return a placeholder that will be replaced
        // when the actual MusicKit integration is complete
        let request = MusicUserTokenRequest()
        return try await request.response()
    }
}

/// Request to get the current user's music token.
struct MusicUserTokenRequest {
    func response() async throws -> String {
        // This is a simplified implementation
        // The actual token retrieval would use MusicKit's internal APIs
        // For now, return an empty string - the real implementation
        // would be done when we have full MusicKit integration
        return ""
    }
}
