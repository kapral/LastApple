import SwiftUI

/// Options view for creating a Similar Artists station.
///
/// Allows the user to search for an artist by name using Last.fm
/// and creates a station with similar artists.
struct SimilarArtistsStationOptionsView: View {
    @Binding var isCreating: Bool
    let onStationCreated: (String) -> Void
    
    @State private var selectedArtist: SearchableString?
    @State private var errorMessage: String?
    
    private let stationAPI: StationAPIProtocol
    private let lastfmAPI: LastfmAPIProtocol
    
    init(
        isCreating: Binding<Bool>,
        onStationCreated: @escaping (String) -> Void,
        stationAPI: StationAPIProtocol = StationAPI(client: APIClient.shared),
        lastfmAPI: LastfmAPIProtocol = LastfmAPI(client: APIClient.shared)
    ) {
        self._isCreating = isCreating
        self.onStationCreated = onStationCreated
        self.stationAPI = stationAPI
        self.lastfmAPI = lastfmAPI
    }
    
    var body: some View {
        VStack(spacing: 12) {
            SearchField<SearchableString>(
                search: searchArtists,
                placeholder: "Search artists...",
                labelAccessor: { $0.value },
                onChanged: { artists in
                    selectedArtist = artists.first
                    errorMessage = nil
                },
                allowMultiple: false
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
            .disabled(isCreating || selectedArtist == nil)
        }
        .padding()
    }
    
    @Sendable
    private func searchArtists(term: String) async throws -> [SearchableString] {
        let results = try await lastfmAPI.searchArtist(term: term)
        return results.map { SearchableString($0.name) }
    }
    
    private func createStation() async {
        guard let artist = selectedArtist else { return }
        
        isCreating = true
        errorMessage = nil
        
        do {
            let station = try await stationAPI.createSimilarArtistsStation(artistName: artist.value)
            
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
    SimilarArtistsStationOptionsView(
        isCreating: .constant(false),
        onStationCreated: { _ in }
    )
    .background(Color.appBackground)
}
#endif
