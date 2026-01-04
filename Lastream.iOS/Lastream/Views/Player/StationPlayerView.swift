import SwiftUI

/// View for playing a station with playlist and controls.
struct StationPlayerView: View {
    let stationId: String
    let onBack: () -> Void
    
    @State private var isLoading = true
    
    var body: some View {
        VStack {
            if isLoading {
                SpinnerView()
            } else {
                // TODO: Implement player UI
                Text("Station: \(stationId)")
                    .foregroundColor(.appText)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.appBackground)
        .task {
            // TODO: Load station
            try? await Task.sleep(for: .seconds(1))
            isLoading = false
        }
    }
}

#Preview {
    StationPlayerView(stationId: "test-id", onBack: {})
}
