import Foundation
import AuthenticationServices

/// Service for managing Last.fm authentication.
///
/// Handles the OAuth flow for Last.fm and manages the user's
/// authentication state.
@Observable
@MainActor
final class LastfmAuthService {
    /// The current authentication state.
    private(set) var state: LastfmAuthState = .unknown
    
    /// Whether scrobbling is enabled.
    private(set) var isScrobblingEnabled: Bool
    
    private let api: LastfmAPIProtocol
    
    /// Creates a new Last.fm authentication service.
    /// - Parameter api: The API client for backend communication.
    init(api: LastfmAPIProtocol) {
        self.api = api
        self.isScrobblingEnabled = UserDefaults.standard.object(forKey: "ScrobblingEnabled") as? Bool ?? true
    }
    
    /// Checks the current authentication status with the backend.
    func checkAuthentication() async {
        state = .loading
        
        do {
            if let user = try await api.getUser() {
                state = .authenticated(user)
            } else {
                state = .unauthenticated
            }
        } catch {
            state = .unauthenticated
        }
    }
    
    /// Initiates the Last.fm OAuth flow.
    /// - Returns: The URL to open for authentication.
    func initiateLogin() async throws -> URL {
        try await api.getAuthUrl(redirectUrl: AppEnvironment.lastfmCallbackURL)
    }
    
    /// Completes the OAuth flow after receiving the callback.
    /// - Parameter token: The authorization token from the callback URL.
    func completeLogin(token: String) async throws {
        state = .loading
        
        do {
            let sessionId = try await api.postToken(token)
            
            // Store session ID
            UserDefaults.standard.set(sessionId, forKey: "SessionId")
            
            // Fetch user info
            if let user = try await api.getUser() {
                state = .authenticated(user)
            } else {
                state = .unauthenticated
            }
        } catch {
            state = .unauthenticated
            throw error
        }
    }
    
    /// Logs out from Last.fm.
    func logout() async throws {
        state = .loading
        
        do {
            try await api.logout()
        } catch {
            print("Failed to logout from Last.fm: \(error)")
        }
        
        state = .unauthenticated
    }
    
    /// Enables or disables scrobbling.
    /// - Parameter enabled: Whether scrobbling should be enabled.
    func setScrobblingEnabled(_ enabled: Bool) {
        isScrobblingEnabled = enabled
        UserDefaults.standard.set(enabled, forKey: "ScrobblingEnabled")
    }
}

// MARK: - Convenience Properties

extension LastfmAuthService {
    /// Whether the user is currently authenticated.
    var isAuthenticated: Bool {
        state.isAuthenticated
    }
    
    /// The authenticated user, if available.
    var user: LastfmUser? {
        state.user
    }
}
