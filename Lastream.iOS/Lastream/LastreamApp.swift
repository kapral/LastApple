import SwiftUI

/// Main entry point for the Lastream iOS application.
///
/// Lastream is a music station generator that integrates with Apple Music
/// and Last.fm to create personalized music stations based on artist similarity,
/// user listening history, and music tags.
@main
struct LastreamApp: App {
    @State private var appleAuthService: AppleMusicAuthService
    @State private var lastfmAuthService: LastfmAuthService
    @State private var selectedStationId: String?
    
    init() {
        let apiClient = APIClient()
        let appleAuthAPI = AppleAuthAPI(client: apiClient)
        let lastfmAPI = LastfmAPI(client: apiClient)
        
        _appleAuthService = State(initialValue: AppleMusicAuthService(api: appleAuthAPI))
        _lastfmAuthService = State(initialValue: LastfmAuthService(api: lastfmAPI))
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView(selectedStationId: $selectedStationId)
                .environment(appleAuthService)
                .environment(lastfmAuthService)
                .onOpenURL { url in
                    handleOAuthCallback(url)
                }
                .task {
                    await appleAuthService.checkAuthorization()
                    await lastfmAuthService.checkAuthentication()
                }
        }
    }
    
    /// Handles OAuth callback URLs for Last.fm authentication.
    /// - Parameter url: The callback URL containing the authentication token.
    private func handleOAuthCallback(_ url: URL) {
        guard url.scheme == "lastream" else { return }
        
        // Handle Last.fm callback: lastream://lastfm-callback?token=xxx
        if url.host == "lastfm-callback",
           let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
           let token = components.queryItems?.first(where: { $0.name == "token" })?.value {
            Task {
                try? await lastfmAuthService.completeLogin(token: token)
            }
        }
    }
}
