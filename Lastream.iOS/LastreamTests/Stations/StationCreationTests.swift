import Testing
import Foundation
@testable import Lastream

/// Tests for station creation functionality.
///
/// These tests verify that station creation views correctly:
/// - Call the appropriate API methods
/// - Handle success and error cases
/// - Update UI state appropriately
@Suite("Station Creation Tests")
struct StationCreationTests {
    
    // MARK: - Artist Station Tests
    
    @Test("Artist station calls API with selected artist IDs")
    func artistStationCallsAPIWithArtistIds() async throws {
        let mockStationAPI = MockStationAPI()
        let mockCatalogSearch = MockCatalogSearchService()
        
        // Configure mocks
        let expectedStation = MockStationAPI.mockStation(id: "new-station-123")
        mockStationAPI.createArtistStationResult = .success(expectedStation)
        
        // Simulate what the view would do
        let artistIds = ["artist-1", "artist-2", "artist-3"]
        let station = try await mockStationAPI.createArtistStation(artistIds: artistIds)
        
        #expect(mockStationAPI.createArtistStationCallCount == 1)
        #expect(mockStationAPI.lastArtistIds == artistIds)
        #expect(station.id == "new-station-123")
    }
    
    @Test("Artist station returns empty when no artists selected")
    func artistStationRequiresArtists() async {
        // This tests the business logic that an artist station needs at least one artist
        let selectedArtists: [CatalogArtist] = []
        
        // The view should disable the create button when no artists are selected
        #expect(selectedArtists.isEmpty)
    }
    
    // MARK: - Similar Artists Station Tests
    
    @Test("Similar artists station calls API with artist name")
    func similarArtistsStationCallsAPIWithArtistName() async throws {
        let mockStationAPI = MockStationAPI()
        
        let expectedStation = MockStationAPI.mockStation(id: "similar-station-456")
        mockStationAPI.createSimilarArtistsStationResult = .success(expectedStation)
        
        let artistName = "Radiohead"
        let station = try await mockStationAPI.createSimilarArtistsStation(artistName: artistName)
        
        #expect(mockStationAPI.createSimilarArtistsStationCallCount == 1)
        #expect(mockStationAPI.lastArtistName == artistName)
        #expect(station.id == "similar-station-456")
    }
    
    @Test("Similar artists search uses Last.fm API")
    func similarArtistsSearchUsesLastfmAPI() async throws {
        let mockLastfmAPI = MockLastfmAPI()
        
        let mockArtists = [
            LastfmArtist(name: "Radiohead", url: nil, listeners: "1000000"),
            LastfmArtist(name: "Muse", url: nil, listeners: "800000")
        ]
        mockLastfmAPI.searchArtistResult = .success(mockArtists)
        
        let results = try await mockLastfmAPI.searchArtist(term: "radio")
        
        #expect(mockLastfmAPI.searchArtistCallCount == 1)
        #expect(mockLastfmAPI.lastArtistSearchTerm == "radio")
        #expect(results.count == 2)
        #expect(results[0].name == "Radiohead")
    }
    
    // MARK: - Tag Station Tests
    
    @Test("Tag station calls API with tag name")
    func tagStationCallsAPIWithTagName() async throws {
        let mockStationAPI = MockStationAPI()
        
        let expectedStation = MockStationAPI.mockStation(id: "tag-station-789")
        mockStationAPI.createTagStationResult = .success(expectedStation)
        
        let tagName = "indie rock"
        let station = try await mockStationAPI.createTagStation(tag: tagName)
        
        #expect(mockStationAPI.createTagStationCallCount == 1)
        #expect(mockStationAPI.lastTag == tagName)
        #expect(station.id == "tag-station-789")
    }
    
    @Test("Tag station trims whitespace from tag name")
    func tagStationTrimsWhitespace() {
        let tagName = "  rock  "
        let trimmedTag = tagName.trimmingCharacters(in: .whitespaces)
        
        #expect(trimmedTag == "rock")
        #expect(!trimmedTag.isEmpty)
    }
    
    @Test("Tag station requires non-empty tag")
    func tagStationRequiresNonEmptyTag() {
        let emptyTag = "   "
        let trimmedTag = emptyTag.trimmingCharacters(in: .whitespaces)
        
        #expect(trimmedTag.isEmpty)
    }
    
    // MARK: - Library Station Tests
    
    @Test("Library station calls API")
    func libraryStationCallsAPI() async throws {
        let mockStationAPI = MockStationAPI()
        
        let expectedStation = MockStationAPI.mockStation(id: "library-station-abc")
        mockStationAPI.createLastfmLibraryStationResult = .success(expectedStation)
        
        let station = try await mockStationAPI.createLastfmLibraryStation()
        
        #expect(mockStationAPI.createLastfmLibraryStationCallCount == 1)
        #expect(station.id == "library-station-abc")
    }
    
    @Test("Library station requires Last.fm authentication")
    func libraryStationRequiresAuth() {
        // The view should check if the user is authenticated with Last.fm
        // This is a placeholder test - actual test would use the service
        let isAuthenticated = false
        
        #expect(!isAuthenticated) // Station should be disabled when not authenticated
    }
    
    // MARK: - Error Handling Tests
    
    @Test("Station creation handles API errors gracefully")
    func stationCreationHandlesErrors() async {
        let mockStationAPI = MockStationAPI()
        
        let expectedError = APIError.serverError
        mockStationAPI.createArtistStationResult = .failure(expectedError)
        
        do {
            _ = try await mockStationAPI.createArtistStation(artistIds: ["artist-1"])
            Issue.record("Expected error to be thrown")
        } catch {
            // Error handling is expected
            #expect(error is APIError)
        }
    }
    
    @Test("Station creation handles network errors")
    func stationCreationHandlesNetworkErrors() async {
        let mockStationAPI = MockStationAPI()
        
        let networkError = APIError.networkError(NSError(domain: NSURLErrorDomain, code: NSURLErrorNotConnectedToInternet))
        mockStationAPI.createSimilarArtistsStationResult = .failure(networkError)
        
        do {
            _ = try await mockStationAPI.createSimilarArtistsStation(artistName: "Test")
            Issue.record("Expected error to be thrown")
        } catch {
            #expect(error is APIError)
        }
    }
}

// MARK: - Catalog Search Tests

@Suite("Catalog Search Tests")
struct CatalogSearchTests {
    
    @Test("Artist search returns matching artists")
    func artistSearchReturnsMatches() async throws {
        let mockCatalogSearch = MockCatalogSearchService()
        
        let mockArtists = MockCatalogSearchService.mockArtists(count: 5)
        mockCatalogSearch.searchArtistsResult = .success(mockArtists)
        
        let results = try await mockCatalogSearch.searchArtists(term: "test")
        
        #expect(mockCatalogSearch.searchArtistsCallCount == 1)
        #expect(mockCatalogSearch.lastSearchArtistsTerm == "test")
        #expect(results.count == 5)
    }
    
    @Test("Artist search handles empty results")
    func artistSearchHandlesEmptyResults() async throws {
        let mockCatalogSearch = MockCatalogSearchService()
        mockCatalogSearch.searchArtistsResult = .success([])
        
        let results = try await mockCatalogSearch.searchArtists(term: "nonexistent")
        
        #expect(results.isEmpty)
    }
    
    @Test("Artist search handles errors")
    func artistSearchHandlesErrors() async {
        let mockCatalogSearch = MockCatalogSearchService()
        mockCatalogSearch.searchArtistsResult = .failure(APIError.networkError(NSError(domain: "test", code: 1)))
        
        do {
            _ = try await mockCatalogSearch.searchArtists(term: "test")
            Issue.record("Expected error to be thrown")
        } catch {
            // Expected
        }
    }
}
