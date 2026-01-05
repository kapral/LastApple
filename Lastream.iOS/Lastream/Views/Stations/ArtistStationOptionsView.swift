import SwiftUI

/// Options view for creating an Artist station.
///
/// Allows the user to search and select one or more artists
/// from the Apple Music catalog.
struct ArtistStationOptionsView: View {
    @Binding var isCreating: Bool
    let onStationCreated: (String) -> Void
    
    @State private var selectedArtists: [CatalogArtist] = []
    @State private var errorMessage: String?
    
    private let stationAPI: StationAPIProtocol
    private let catalogSearch: CatalogSearching
    
    init(
        isCreating: Binding<Bool>,
        onStationCreated: @escaping (String) -> Void,
        stationAPI: StationAPIProtocol = StationAPI(client: APIClient.shared),
        catalogSearch: CatalogSearching = CatalogSearchService.shared
    ) {
        self._isCreating = isCreating
        self.onStationCreated = onStationCreated
        self.stationAPI = stationAPI
        self.catalogSearch = catalogSearch
    }
    
    var body: some View {
        VStack(spacing: 12) {
            SearchField<CatalogArtist>(
                search: searchArtists,
                placeholder: "Search artists...",
                labelAccessor: { $0.name },
                onChanged: { artists in
                    selectedArtists = artists
                    errorMessage = nil
                },
                allowMultiple: true
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
            .disabled(isCreating || selectedArtists.isEmpty)
        }
        .padding()
    }
    
    @Sendable
    private func searchArtists(term: String) async throws -> [CatalogArtist] {
        try await catalogSearch.searchArtists(term: term)
    }
    
    private func createStation() async {
        guard !selectedArtists.isEmpty else { return }
        
        isCreating = true
        errorMessage = nil
        
        do {
            let artistIds = selectedArtists.map { $0.id }
            let station = try await stationAPI.createArtistStation(artistIds: artistIds)
            
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
    ArtistStationOptionsView(
        isCreating: .constant(false),
        onStationCreated: { _ in }
    )
    .background(Color.appBackground)
}
#endif
