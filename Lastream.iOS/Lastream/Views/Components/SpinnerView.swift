import SwiftUI

/// A loading spinner view.
struct SpinnerView: View {
    var body: some View {
        ProgressView()
            .progressViewStyle(CircularProgressViewStyle(tint: .appText))
            .scaleEffect(1.5)
    }
}

#Preview {
    SpinnerView()
        .frame(width: 100, height: 100)
        .background(Color.appBackground)
}
