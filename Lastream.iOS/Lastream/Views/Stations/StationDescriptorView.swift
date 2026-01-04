import SwiftUI

/// A view that displays a station type with its description and creation button.
struct StationDescriptorView: View {
    let type: StationType
    let onStationCreated: (String) -> Void
    
    @State private var isExpanded = false
    @State private var isCreating = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header row
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(type.title)
                            .font(.headline)
                            .foregroundColor(.appText)
                        
                        Text(type.description)
                            .font(.caption)
                            .foregroundColor(.appTextMuted)
                    }
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(.appTextMuted)
                }
                .padding(.horizontal, 15)
                .padding(.vertical, 12)
            }
            .buttonStyle(.plain)
            
            // Expanded content
            if isExpanded {
                StationOptionsView(
                    type: type,
                    isCreating: $isCreating,
                    onStationCreated: onStationCreated
                )
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .background(Color.appSecondaryBackground)
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.appBorder, lineWidth: 1)
        )
        .padding(.horizontal, 5)
        .padding(.vertical, 5)
    }
}

/// View for station-specific options and creation button.
struct StationOptionsView: View {
    let type: StationType
    @Binding var isCreating: Bool
    let onStationCreated: (String) -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            // Station-specific content would go here
            // For now, show a placeholder
            
            Button {
                // TODO: Implement station creation
            } label: {
                if isCreating {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Create Station")
                }
            }
            .buttonStyle(.appPrimary)
            .disabled(isCreating)
        }
        .padding()
    }
}

#if DEBUG
#Preview {
    VStack {
        StationDescriptorView(type: .artist, onStationCreated: { _ in })
        StationDescriptorView(type: .lastfmlibrary, onStationCreated: { _ in })
    }
    .background(Color.appBackground)
    .environment(PreviewHelpers.makeAppleMusicAuthService())
    .environment(PreviewHelpers.makeLastfmAuthService())
}
#endif
