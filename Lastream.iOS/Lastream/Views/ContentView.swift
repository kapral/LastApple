import SwiftUI

/// The main content view that manages navigation between home and station player views.
struct ContentView: View {
    @Binding var selectedStationId: String?
    @Environment(AppleMusicAuthService.self) private var appleAuthService
    
    var body: some View {
        VStack(spacing: 0) {
            HeaderView()
            
            if let stationId = selectedStationId {
                StationPlayerView(
                    stationId: stationId,
                    onBack: { selectedStationId = nil }
                )
            } else {
                HomeView(onStationSelected: { id in
                    selectedStationId = id
                })
            }
            
            FooterView()
        }
        .background(Color.appBackground)
        .preferredColorScheme(.dark)
    }
}

#if DEBUG
#Preview {
    ContentView(selectedStationId: .constant(nil))
        .environment(PreviewHelpers.makeAppleMusicAuthService())
        .environment(PreviewHelpers.makeLastfmAuthService())
}
#endif
