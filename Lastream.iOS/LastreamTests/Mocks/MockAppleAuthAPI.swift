import Foundation
@testable import Lastream

/// Mock implementation of AppleAuthAPIProtocol for testing.
final class MockAppleAuthAPI: AppleAuthAPIProtocol, @unchecked Sendable {
    var getDeveloperTokenResult: Result<String, Error> = .success("mock-developer-token")
    var getSessionDataResult: Result<Session, Error> = .success(Session(
        id: UUID(),
        startedAt: Date(),
        lastActivityAt: Date(),
        lastfmSessionKey: nil,
        lastfmUsername: nil,
        musicUserToken: nil,
        musicStorefrontId: nil
    ))
    var postSessionDataResult: Result<Session, Error> = .success(Session(
        id: UUID(),
        startedAt: Date(),
        lastActivityAt: Date(),
        lastfmSessionKey: nil,
        lastfmUsername: nil,
        musicUserToken: "mock-token",
        musicStorefrontId: "us"
    ))
    var deleteSessionDataError: Error?
    
    var getDeveloperTokenCallCount = 0
    var getSessionDataCallCount = 0
    var postSessionDataCallCount = 0
    var deleteSessionDataCallCount = 0
    var lastPostedSessionData: AppleMusicSessionData?
    
    func getDeveloperToken() async throws -> String {
        getDeveloperTokenCallCount += 1
        return try getDeveloperTokenResult.get()
    }
    
    func getSessionData() async throws -> Session {
        getSessionDataCallCount += 1
        return try getSessionDataResult.get()
    }
    
    func postSessionData(_ data: AppleMusicSessionData) async throws -> Session {
        postSessionDataCallCount += 1
        lastPostedSessionData = data
        return try postSessionDataResult.get()
    }
    
    func deleteSessionData() async throws {
        deleteSessionDataCallCount += 1
        if let error = deleteSessionDataError {
            throw error
        }
    }
    
    func reset() {
        getDeveloperTokenCallCount = 0
        getSessionDataCallCount = 0
        postSessionDataCallCount = 0
        deleteSessionDataCallCount = 0
        lastPostedSessionData = nil
        getDeveloperTokenResult = .success("mock-developer-token")
        deleteSessionDataError = nil
    }
}
