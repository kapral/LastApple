import Testing
import Foundation
@testable import Lastream

/// Tests for LastfmAuthService behavior.
///
/// These tests verify that the service correctly updates its state
/// based on API responses and user actions.
@Suite("LastfmAuthService Behavior Tests")
@MainActor
struct LastfmAuthServiceTests {
    
    // MARK: - Test Helpers
    
    /// Creates a mock LastfmUser for testing.
    private static func mockUser(name: String) -> LastfmUser {
        LastfmUser(
            name: name,
            realName: nil,
            url: nil,
            image: nil,
            playcount: nil,
            artistCount: nil,
            trackCount: nil,
            albumCount: nil
        )
    }
    
    // MARK: - checkAuthentication Tests
    
    @Test("checkAuthentication sets state to authenticated when user exists")
    func checkAuthenticationWhenUserExists() async {
        let mockAPI = MockLastfmAPI()
        let mockUser = Self.mockUser(name: "testuser")
        mockAPI.getUserResult = .success(mockUser)
        
        let service = LastfmAuthService(api: mockAPI)
        
        await service.checkAuthentication()
        
        #expect(service.state == .authenticated(mockUser))
        #expect(service.isAuthenticated == true)
        #expect(service.user?.name == "testuser")
    }
    
    @Test("checkAuthentication sets state to unauthenticated when no user")
    func checkAuthenticationWhenNoUser() async {
        let mockAPI = MockLastfmAPI()
        mockAPI.getUserResult = .success(nil)
        
        let service = LastfmAuthService(api: mockAPI)
        
        await service.checkAuthentication()
        
        #expect(service.state == .unauthenticated)
        #expect(service.isAuthenticated == false)
    }
    
    @Test("checkAuthentication sets state to unauthenticated on error")
    func checkAuthenticationOnError() async {
        let mockAPI = MockLastfmAPI()
        mockAPI.getUserResult = .failure(NSError(domain: "TestError", code: 500))
        
        let service = LastfmAuthService(api: mockAPI)
        
        await service.checkAuthentication()
        
        #expect(service.state == .unauthenticated)
    }
    
    // MARK: - initiateLogin Tests
    
    @Test("initiateLogin returns auth URL from API")
    func initiateLoginReturnsUrl() async throws {
        let mockAPI = MockLastfmAPI()
        let expectedUrl = URL(string: "https://last.fm/auth?callback=test")!
        mockAPI.getAuthUrlResult = .success(expectedUrl)
        
        let service = LastfmAuthService(api: mockAPI)
        
        let url = try await service.initiateLogin()
        
        #expect(url == expectedUrl)
        #expect(mockAPI.getAuthUrlCallCount == 1)
        #expect(mockAPI.lastRedirectUrl == AppEnvironment.lastfmCallbackURL)
    }
    
    @Test("initiateLogin propagates errors")
    func initiateLoginError() async {
        let mockAPI = MockLastfmAPI()
        mockAPI.getAuthUrlResult = .failure(NSError(domain: "TestError", code: 404))
        
        let service = LastfmAuthService(api: mockAPI)
        
        do {
            _ = try await service.initiateLogin()
            Issue.record("Expected error to be thrown")
        } catch {
            // Expected
        }
    }
    
    // MARK: - completeLogin Tests
    
    @Test("completeLogin sets state to authenticated on success")
    func completeLoginSuccess() async throws {
        let mockAPI = MockLastfmAPI()
        mockAPI.postTokenResult = .success("session-123")
        let mockUser = Self.mockUser(name: "authenticateduser")
        mockAPI.getUserResult = .success(mockUser)
        
        let service = LastfmAuthService(api: mockAPI)
        
        try await service.completeLogin(token: "auth-token-abc")
        
        #expect(service.state == .authenticated(mockUser))
        #expect(mockAPI.postTokenCallCount == 1)
        #expect(mockAPI.lastToken == "auth-token-abc")
        #expect(mockAPI.getUserCallCount == 1)
    }
    
    @Test("completeLogin stores session ID")
    func completeLoginStoresSessionId() async throws {
        let mockAPI = MockLastfmAPI()
        mockAPI.postTokenResult = .success("new-session-id-456")
        mockAPI.getUserResult = .success(Self.mockUser(name: "user"))
        
        let service = LastfmAuthService(api: mockAPI)
        
        // Clear any previous value
        UserDefaults.standard.removeObject(forKey: "SessionId")
        
        try await service.completeLogin(token: "token")
        
        let storedSessionId = UserDefaults.standard.string(forKey: "SessionId")
        #expect(storedSessionId == "new-session-id-456")
    }
    
    @Test("completeLogin sets state to unauthenticated when token fails")
    func completeLoginTokenFails() async {
        let mockAPI = MockLastfmAPI()
        mockAPI.postTokenResult = .failure(NSError(domain: "TestError", code: 401))
        
        let service = LastfmAuthService(api: mockAPI)
        
        do {
            try await service.completeLogin(token: "invalid-token")
            Issue.record("Expected error to be thrown")
        } catch {
            #expect(service.state == .unauthenticated)
        }
    }
    
    @Test("completeLogin sets state to unauthenticated when getUser fails")
    func completeLoginGetUserFails() async throws {
        let mockAPI = MockLastfmAPI()
        mockAPI.postTokenResult = .success("session-id")
        mockAPI.getUserResult = .success(nil)  // No user returned
        
        let service = LastfmAuthService(api: mockAPI)
        
        try await service.completeLogin(token: "token")
        
        #expect(service.state == .unauthenticated)
    }
    
    // MARK: - logout Tests
    
    @Test("logout sets state to unauthenticated")
    func logoutSetsStateToUnauthenticated() async throws {
        let mockAPI = MockLastfmAPI()
        let mockUser = Self.mockUser(name: "user")
        mockAPI.getUserResult = .success(mockUser)
        
        let service = LastfmAuthService(api: mockAPI)
        
        // First authenticate
        await service.checkAuthentication()
        #expect(service.isAuthenticated == true)
        
        // Then logout
        try await service.logout()
        
        #expect(service.state == .unauthenticated)
        #expect(mockAPI.logoutCallCount == 1)
    }
    
    @Test("logout sets state to unauthenticated even if backend fails")
    func logoutBackendFails() async throws {
        let mockAPI = MockLastfmAPI()
        mockAPI.logoutError = NSError(domain: "TestError", code: 500)
        
        let service = LastfmAuthService(api: mockAPI)
        
        try await service.logout()
        
        #expect(service.state == .unauthenticated)
    }
    
    // MARK: - Scrobbling Tests
    
    @Test("scrobbling is enabled by default")
    func scrobblingEnabledByDefault() {
        // Clear any stored value
        UserDefaults.standard.removeObject(forKey: "ScrobblingEnabled")
        
        let mockAPI = MockLastfmAPI()
        let service = LastfmAuthService(api: mockAPI)
        
        #expect(service.isScrobblingEnabled == true)
    }
    
    @Test("setScrobblingEnabled persists setting")
    func setScrobblingEnabledPersists() {
        let mockAPI = MockLastfmAPI()
        let service = LastfmAuthService(api: mockAPI)
        
        service.setScrobblingEnabled(false)
        
        #expect(service.isScrobblingEnabled == false)
        #expect(UserDefaults.standard.bool(forKey: "ScrobblingEnabled") == false)
        
        service.setScrobblingEnabled(true)
        
        #expect(service.isScrobblingEnabled == true)
        #expect(UserDefaults.standard.bool(forKey: "ScrobblingEnabled") == true)
    }
}
