import Testing
import Foundation
import MusicKit
@testable import Lastream

/// Tests for AppleMusicAuthService behavior.
///
/// These tests verify that the service correctly updates its state
/// based on MusicKit authorization results and API responses.
@Suite("AppleMusicAuthService Behavior Tests")
@MainActor
struct AppleMusicAuthServiceTests {
    
    // MARK: - checkAuthorization Tests
    
    @Test("checkAuthorization sets state to authenticated when MusicKit is authorized")
    func checkAuthorizationWhenAuthorized() async {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        mockProvider.currentStatusValue = .authorized
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        await service.checkAuthorization()
        
        #expect(service.state == .authenticated)
    }
    
    @Test("checkAuthorization sets state to unauthenticated when not determined")
    func checkAuthorizationWhenNotDetermined() async {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        mockProvider.currentStatusValue = .notDetermined
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        await service.checkAuthorization()
        
        #expect(service.state == .unauthenticated)
    }
    
    @Test("checkAuthorization sets state to unauthenticated when denied")
    func checkAuthorizationWhenDenied() async {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        mockProvider.currentStatusValue = .denied
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        await service.checkAuthorization()
        
        #expect(service.state == .unauthenticated)
    }
    
    // MARK: - authorize Tests
    
    @Test("authorize sets state to authenticated on successful authorization")
    func authorizeSuccess() async throws {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        mockProvider.requestAuthorizationResult = .authorized
        mockProvider.getUserTokenResult = .success("test-token")
        mockProvider.getCountryCodeResult = .success("gb")
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        try await service.authorize()
        
        #expect(service.state == .authenticated)
        #expect(mockProvider.requestAuthorizationCallCount == 1)
        #expect(mockProvider.getUserTokenCallCount == 1)
        #expect(mockProvider.getCountryCodeCallCount == 1)
    }
    
    @Test("authorize posts session data to backend")
    func authorizeSyncsWithBackend() async throws {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        mockProvider.requestAuthorizationResult = .authorized
        mockProvider.getUserTokenResult = .success("user-token-123")
        mockProvider.getCountryCodeResult = .success("fr")
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        try await service.authorize()
        
        #expect(mockAPI.postSessionDataCallCount == 1)
        #expect(mockAPI.lastPostedSessionData?.musicUserToken == "user-token-123")
        #expect(mockAPI.lastPostedSessionData?.musicStorefrontId == "fr")
    }
    
    @Test("authorize sets state to unauthenticated when user denies")
    func authorizeUserDenies() async throws {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        mockProvider.requestAuthorizationResult = .denied
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        try await service.authorize()
        
        #expect(service.state == .unauthenticated)
        #expect(mockAPI.postSessionDataCallCount == 0) // Should not call backend
    }
    
    @Test("authorize still authenticates locally even if backend sync fails")
    func authorizeBackendSyncFailsButLocalSucceeds() async throws {
        let mockAPI = MockAppleAuthAPI()
        mockAPI.postSessionDataResult = .failure(NSError(domain: "TestError", code: 500))
        
        let mockProvider = MockMusicKitProvider()
        mockProvider.requestAuthorizationResult = .authorized
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        try await service.authorize()
        
        // Should still be authenticated because MusicKit succeeded
        #expect(service.state == .authenticated)
    }
    
    @Test("authorize stores session ID from backend response")
    func authorizeStoresSessionId() async throws {
        let sessionId = UUID()
        let mockAPI = MockAppleAuthAPI()
        mockAPI.postSessionDataResult = .success(Session(
            id: sessionId,
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: "token",
            musicStorefrontId: "us"
        ))
        
        let mockProvider = MockMusicKitProvider()
        mockProvider.requestAuthorizationResult = .authorized
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        // Clear any previous value
        UserDefaults.standard.removeObject(forKey: "SessionId")
        
        try await service.authorize()
        
        let storedSessionId = UserDefaults.standard.string(forKey: "SessionId")
        #expect(storedSessionId == sessionId.uuidString)
    }
    
    // MARK: - unauthorize Tests
    
    @Test("unauthorize sets state to unauthenticated")
    func unauthorizeSetsStateToUnauthenticated() async throws {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        try await service.unauthorize()
        
        #expect(service.state == .unauthenticated)
    }
    
    @Test("unauthorize calls delete session data on backend")
    func unauthorizeCallsBackend() async throws {
        let mockAPI = MockAppleAuthAPI()
        let mockProvider = MockMusicKitProvider()
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        try await service.unauthorize()
        
        #expect(mockAPI.deleteSessionDataCallCount == 1)
    }
    
    @Test("unauthorize still sets state even if backend call fails")
    func unauthorizeBackendFails() async throws {
        let mockAPI = MockAppleAuthAPI()
        mockAPI.deleteSessionDataError = NSError(domain: "TestError", code: 500)
        let mockProvider = MockMusicKitProvider()
        
        let service = AppleMusicAuthService(api: mockAPI, musicKitProvider: mockProvider)
        
        try await service.unauthorize()
        
        #expect(service.state == .unauthenticated)
    }
}
