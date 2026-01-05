import SwiftUI

/// Options view for creating a Last.fm Library station.
///
/// Creates a station based on the user's Last.fm library.
/// Requires Last.fm authentication.
struct LibraryStationOptionsView: View {
    @Environment(LastfmAuthService.self) private var lastfmAuthService
    
    @Binding var isCreating: Bool
    let onStationCreated: (String) -> Void
    
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
            if !lastfmAuthService.isAuthenticated {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.yellow)
                    
                    Text("Log in to Last.fm to listen to your library.")
                        .font(.subheadline)
                        .foregroundColor(.yellow)
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.yellow.opacity(0.1))
                .cornerRadius(8)
            } else if let user = lastfmAuthService.user {
                HStack {
                    Image(systemName: "music.note.list")
                        .foregroundColor(.appAccent)
                    
                    Text("Create a station from \(user.name)'s library")
                        .font(.subheadline)
                        .foregroundColor(.appText)
                }
                .padding()
            }
            
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
            .disabled(isCreating || !lastfmAuthService.isAuthenticated)
        }
        .padding()
    }
    
    private func createStation() async {
        guard lastfmAuthService.isAuthenticated else { return }
        
        isCreating = true
        errorMessage = nil
        
        do {
            let station = try await stationAPI.createLastfmLibraryStation()
            
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
    LibraryStationOptionsView(
        isCreating: .constant(false),
        onStationCreated: { _ in }
    )
    .environment(PreviewHelpers.makeLastfmAuthService())
    .background(Color.appBackground)
}
#endif
