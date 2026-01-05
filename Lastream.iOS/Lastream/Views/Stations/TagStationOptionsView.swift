import SwiftUI

/// Options view for creating a Tag station.
///
/// Allows the user to enter a genre/tag name to create
/// a station with tracks matching that tag.
struct TagStationOptionsView: View {
    @Binding var isCreating: Bool
    let onStationCreated: (String) -> Void
    
    @State private var tagName: String = ""
    @State private var errorMessage: String?
    
    private let stationAPI: StationAPIProtocol
    
    init(
        isCreating: Binding<Bool>,
        onStationCreated: @escaping (String) -> Void,
        stationAPI: StationAPIProtocol = StationAPI(client: APIClient.shared)
    ) {
        self._isCreating = isCreating
        self.onStationCreated = onStationCreated
        self.stationAPI = stationAPI
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "tag")
                    .foregroundColor(.appTextMuted)
                
                TextField("Enter a tag (e.g., rock, jazz, indie)...", text: $tagName)
                    .textFieldStyle(.plain)
                    .foregroundColor(.appText)
                    .autocorrectionDisabled()
                    .onChange(of: tagName) { _, _ in
                        errorMessage = nil
                    }
                
                if !tagName.isEmpty {
                    Button {
                        tagName = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.appTextMuted)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.appSecondaryBackground)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.appBorder, lineWidth: 1)
            )
            
            if let error = errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }
            
            Button {
                Task {
                    await createStation()
                }
            } label: {
                if isCreating {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Create Station")
                }
            }
            .buttonStyle(.appPrimary)
            .disabled(isCreating || tagName.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding()
    }
    
    private func createStation() async {
        let trimmedTag = tagName.trimmingCharacters(in: .whitespaces)
        guard !trimmedTag.isEmpty else { return }
        
        isCreating = true
        errorMessage = nil
        
        do {
            let station = try await stationAPI.createTagStation(tag: trimmedTag)
            
            await MainActor.run {
                onStationCreated(station.id)
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to create station: \(error.localizedDescription)"
                isCreating = false
            }
        }
    }
}

#if DEBUG
#Preview {
    TagStationOptionsView(
        isCreating: .constant(false),
        onStationCreated: { _ in }
    )
    .background(Color.appBackground)
}
#endif
