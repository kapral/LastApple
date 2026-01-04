import Testing
import Foundation
@testable import Lastream

/// Tests for the AppleAuthAPI.
@Suite("AppleAuthAPI Tests")
struct AppleAuthAPITests {
    
    @Test("getDeveloperToken calls correct endpoint")
    func getDeveloperTokenEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = AppleAuthAPI(client: mockClient)
        
        mockClient.getStringHandler = { endpoint in
            #expect(endpoint == "api/apple/auth/developertoken")
            return "test-developer-token"
        }
        
        let token = try await api.getDeveloperToken()
        #expect(token == "test-developer-token")
        #expect(mockClient.getCalls.count == 1)
    }
    
    @Test("getSessionData calls correct endpoint")
    func getSessionDataEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = AppleAuthAPI(client: mockClient)
        
        let expectedSession = Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: "token",
            musicStorefrontId: "us"
        )
        
        mockClient.getHandler = { endpoint in
            #expect(endpoint == "api/apple/auth/sessiondata")
            return expectedSession
        }
        
        let session = try await api.getSessionData()
        #expect(session.musicUserToken == "token")
        #expect(mockClient.getCalls.count == 1)
    }
    
    @Test("postSessionData sends correct data")
    func postSessionDataSendsCorrectData() async throws {
        let mockClient = MockAPIClient()
        let api = AppleAuthAPI(client: mockClient)
        
        let expectedSession = Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: "new-token",
            musicStorefrontId: "gb"
        )
        
        mockClient.postHandler = { endpoint, body in
            #expect(endpoint == "api/apple/auth/sessiondata")
            if let data = body as? AppleMusicSessionData {
                #expect(data.musicUserToken == "new-token")
                #expect(data.musicStorefrontId == "gb")
            }
            return expectedSession
        }
        
        let inputData = AppleMusicSessionData(musicUserToken: "new-token", musicStorefrontId: "gb")
        let session = try await api.postSessionData(inputData)
        #expect(session.musicUserToken == "new-token")
        #expect(mockClient.postCalls.count == 1)
    }
    
    @Test("deleteSessionData calls correct endpoint")
    func deleteSessionDataEndpoint() async throws {
        let mockClient = MockAPIClient()
        let api = AppleAuthAPI(client: mockClient)
        
        mockClient.deleteHandler = { endpoint in
            #expect(endpoint == "api/apple/auth/sessiondata")
        }
        
        try await api.deleteSessionData()
        #expect(mockClient.deleteCalls.count == 1)
    }
}
