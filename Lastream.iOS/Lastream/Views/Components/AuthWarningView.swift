import SwiftUI

/// Warning banner shown when Apple Music is not authorized.
struct AuthWarningView: View {
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.appWarning)
            
            Text("Connect to Apple Music in Settings to start listening.")
                .font(.subheadline)
                .foregroundColor(.appWarning)
            
            Spacer()
        }
        .padding()
        .background(Color.appWarning.opacity(0.15))
        .cornerRadius(8)
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}

#Preview {
    AuthWarningView()
        .background(Color.appBackground)
}
