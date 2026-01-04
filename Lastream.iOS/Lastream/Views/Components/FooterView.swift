import SwiftUI

/// The app footer.
struct FooterView: View {
    var body: some View {
        HStack {
            Spacer()
            
            Text("Lastream")
                .font(.caption)
                .foregroundColor(.appTextMuted)
            
            Spacer()
        }
        .padding(.vertical, 8)
        .background(Color.appSecondaryBackground)
    }
}

#Preview {
    FooterView()
}
