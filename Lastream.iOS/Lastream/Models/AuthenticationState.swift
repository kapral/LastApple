import Foundation

/// Represents the authentication state for a service.
enum AuthenticationState: Sendable, Equatable {
    /// Authentication state is not yet known.
    case unknown
    
    /// Currently checking or performing authentication.
    case loading
    
    /// Successfully authenticated.
    case authenticated
    
    /// Not authenticated.
    case unauthenticated
}

/// Extended state for Last.fm authentication that includes user info.
enum LastfmAuthState: Sendable, Equatable {
    /// Authentication state is not yet known.
    case unknown
    
    /// Currently checking or performing authentication.
    case loading
    
    /// Successfully authenticated with user information.
    case authenticated(LastfmUser)
    
    /// Not authenticated.
    case unauthenticated
    
    /// Whether the user is currently authenticated.
    var isAuthenticated: Bool {
        if case .authenticated = self { return true }
        return false
    }
    
    /// The authenticated user, if available.
    var user: LastfmUser? {
        if case .authenticated(let user) = self { return user }
        return nil
    }
    
    static func == (lhs: LastfmAuthState, rhs: LastfmAuthState) -> Bool {
        switch (lhs, rhs) {
        case (.unknown, .unknown), (.loading, .loading), (.unauthenticated, .unauthenticated):
            return true
        case (.authenticated(let lhsUser), .authenticated(let rhsUser)):
            return lhsUser.name == rhsUser.name
        default:
            return false
        }
    }
}
