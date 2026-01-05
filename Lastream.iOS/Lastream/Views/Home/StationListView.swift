import SwiftUI

/// Displays the list of available station types.
struct StationListView: View {
    let onStationSelected: (String) -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            StationDescriptorView(
                type: .lastfmlibrary,
                onStationCreated: onStationSelected
            )
            
            StationDescriptorView(
                type: .artist,
                onStationCreated: onStationSelected
            )
            
            StationDescriptorView(
                type: .similarartists,
                onStationCreated: onStationSelected
            )
            
            StationDescriptorView(
                type: .tags,
                onStationCreated: onStationSelected
            )
        }
        .padding(5)
    }
}

#if DEBUG
#Preview {
    StationListView(onStationSelected: { _ in })
        .background(Color.appBackground)
        .environment(PreviewHelpers.makeAppleMusicAuthService())
        .environment(PreviewHelpers.makeLastfmAuthService())
}
#endif
