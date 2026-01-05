import SwiftUI

/// The app header with navigation and title.
struct HeaderView: View {
    var body: some View {
        HStack {
            Text("Lastream")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.appText)
                .accessibilityAddTraits(.isHeader)
            
            Spacer()
            
            NavigationLink(destination: SettingsView()) {
                Image(systemName: "gear")
                    .font(.title3)
                    .foregroundColor(.appText)
            }
            .accessibilityLabel("Settings")
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color.appSecondaryBackground)
    }
}

#Preview {
    NavigationStack {
        HeaderView()
    }
}
