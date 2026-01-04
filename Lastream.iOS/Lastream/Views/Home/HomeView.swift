import SwiftUI

/// The home view displaying available station types.
struct HomeView: View {
    @Environment(AppleMusicAuthService.self) private var appleAuthService
    let onStationSelected: (String) -> Void
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if appleAuthService.state == .unauthenticated {
                    AuthWarningView()
                }
                
                StationListView(onStationSelected: onStationSelected)
            }
        }
        .background(Color.appBackground)
    }
}

#if DEBUG
#Preview {
    HomeView(onStationSelected: { _ in })
        .environment(PreviewHelpers.makeAppleMusicAuthService())
        .environment(PreviewHelpers.makeLastfmAuthService())
}
#endif
