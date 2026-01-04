import Testing
import Foundation
@testable import Lastream

/// Tests for the APIClient.
@Suite("APIClient Tests")
struct APIClientTests {
    
    @Test("Session ID is stored in UserDefaults")
    func sessionIdStorage() {
        let client = APIClient()
        
        client.sessionId = "test-session-id"
        #expect(client.sessionId == "test-session-id")
        
        client.sessionId = nil
        #expect(client.sessionId == nil)
    }
    
    @Test("AppEnvironment provides correct API URL")
    func environmentConfiguration() {
        let url = AppEnvironment.apiURL
        #expect(url.absoluteString.contains("lastream"))
    }
    
    @Test("AppEnvironment provides correct hub URL")
    func hubUrlConfiguration() {
        let hubUrl = AppEnvironment.hubURL
        #expect(hubUrl.absoluteString.contains("hubs"))
    }
    
    @Test("AppEnvironment provides correct callback URL")
    func callbackUrlConfiguration() {
        let callbackUrl = AppEnvironment.lastfmCallbackURL
        #expect(callbackUrl == "lastream://lastfm-callback")
    }
}
