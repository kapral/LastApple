import Foundation
@testable import Lastream

/// Mock implementation of StationHubServiceProtocol for testing.
@MainActor
final class MockStationHubService: StationHubServiceProtocol {
    // MARK: - State
    
    var isConnected: Bool = false
    var currentStationId: String?
    
    // MARK: - Control Results
    
    var connectError: Error?
    
    // MARK: - Call Tracking
    
    var connectCallCount = 0
    var disconnectCallCount = 0
    var subscribeToStationCallCount = 0
    var unsubscribeFromStationCallCount = 0
    var onTrackAddedCallCount = 0
    
    var lastSubscribedStationId: String?
    
    // MARK: - Event Simulation
    
    private var trackAddedHandler: ((String, String, Int) -> Void)?
    
    // MARK: - StationHubServiceProtocol
    
    func connect() async throws {
        connectCallCount += 1
        if let error = connectError {
            throw error
        }
        isConnected = true
    }
    
    func disconnect() async {
        disconnectCallCount += 1
        isConnected = false
        currentStationId = nil
    }
    
    func subscribeToStation(id: String) {
        subscribeToStationCallCount += 1
        lastSubscribedStationId = id
        currentStationId = id
    }
    
    func unsubscribeFromStation() {
        unsubscribeFromStationCallCount += 1
        currentStationId = nil
    }
    
    func onTrackAdded(_ handler: @escaping (String, String, Int) -> Void) {
        onTrackAddedCallCount += 1
        trackAddedHandler = handler
    }
    
    // MARK: - Test Helpers
    
    /// Simulates a track added event from the server.
    func simulateTrackAdded(stationId: String, trackId: String, position: Int) {
        trackAddedHandler?(stationId, trackId, position)
    }
    
    func reset() {
        isConnected = false
        currentStationId = nil
        connectError = nil
        connectCallCount = 0
        disconnectCallCount = 0
        subscribeToStationCallCount = 0
        unsubscribeFromStationCallCount = 0
        onTrackAddedCallCount = 0
        lastSubscribedStationId = nil
        trackAddedHandler = nil
    }
}
