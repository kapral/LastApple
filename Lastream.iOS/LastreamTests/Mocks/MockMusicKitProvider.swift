import Foundation
import MusicKit
@testable import Lastream

/// Mock implementation of MusicAuthorizationProviding for testing.
final class MockMusicKitProvider: MusicAuthorizationProviding, @unchecked Sendable {
    var currentStatusValue: MusicAuthorization.Status = .notDetermined
    var requestAuthorizationResult: MusicAuthorization.Status = .authorized
    var getUserTokenResult: Result<String, Error> = .success("mock-user-token")
    var getCountryCodeResult: Result<String, Error> = .success("us")
    
    var requestAuthorizationCallCount = 0
    var getUserTokenCallCount = 0
    var getCountryCodeCallCount = 0
    
    var currentStatus: MusicAuthorization.Status {
        currentStatusValue
    }
    
    func requestAuthorization() async -> MusicAuthorization.Status {
        requestAuthorizationCallCount += 1
        return requestAuthorizationResult
    }
    
    func getUserToken() async throws -> String {
        getUserTokenCallCount += 1
        return try getUserTokenResult.get()
    }
    
    func getCountryCode() async throws -> String {
        getCountryCodeCallCount += 1
        return try getCountryCodeResult.get()
    }
    
    func reset() {
        currentStatusValue = .notDetermined
        requestAuthorizationResult = .authorized
        getUserTokenResult = .success("mock-user-token")
        getCountryCodeResult = .success("us")
        requestAuthorizationCallCount = 0
        getUserTokenCallCount = 0
        getCountryCodeCallCount = 0
    }
}
