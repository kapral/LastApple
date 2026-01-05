import Testing
import Foundation
@testable import Lastream

/// Tests for StationHubService behavior.
@Suite("StationHubService Tests")
@MainActor
struct StationHubServiceTests {
    
    // MARK: - Helper Functions
    
    private func makeMockHub() -> MockStationHubService {
        MockStationHubService()
    }
    
    // MARK: - Connection Tests
    
    @Test("Initial state is disconnected")
    func testInitialState() async {
        let hub = makeMockHub()
        
        #expect(hub.isConnected == false)
        #expect(hub.currentStationId == nil)
    }
    
    @Test("Connect sets isConnected to true")
    func testConnect() async throws {
        let hub = makeMockHub()
        
        try await hub.connect()
        
        #expect(hub.isConnected == true)
        #expect(hub.connectCallCount == 1)
    }
    
    @Test("Connect throws on error")
    func testConnectError() async {
        let hub = makeMockHub()
        hub.connectError = SignalRError.connectionFailed
        
        await #expect(throws: SignalRError.self) {
            try await hub.connect()
        }
        
        #expect(hub.isConnected == false)
    }
    
    @Test("Disconnect sets isConnected to false")
    func testDisconnect() async throws {
        let hub = makeMockHub()
        try await hub.connect()
        
        await hub.disconnect()
        
        #expect(hub.isConnected == false)
        #expect(hub.disconnectCallCount == 1)
    }
    
    // MARK: - Subscription Tests
    
    @Test("Subscribe to station sets current station ID")
    func testSubscribeToStation() async throws {
        let hub = makeMockHub()
        try await hub.connect()
        
        hub.subscribeToStation(id: "station-123")
        
        #expect(hub.currentStationId == "station-123")
        #expect(hub.subscribeToStationCallCount == 1)
        #expect(hub.lastSubscribedStationId == "station-123")
    }
    
    @Test("Unsubscribe clears current station ID")
    func testUnsubscribeFromStation() async throws {
        let hub = makeMockHub()
        try await hub.connect()
        hub.subscribeToStation(id: "station-123")
        
        hub.unsubscribeFromStation()
        
        #expect(hub.currentStationId == nil)
        #expect(hub.unsubscribeFromStationCallCount == 1)
    }
    
    // MARK: - Event Handler Tests
    
    @Test("Track added handler is registered")
    func testOnTrackAdded() async {
        let hub = makeMockHub()
        var receivedEvents: [(String, String, Int)] = []
        
        hub.onTrackAdded { stationId, trackId, position in
            receivedEvents.append((stationId, trackId, position))
        }
        
        #expect(hub.onTrackAddedCallCount == 1)
        
        // Simulate event
        hub.simulateTrackAdded(stationId: "station-1", trackId: "track-abc", position: 5)
        
        #expect(receivedEvents.count == 1)
        #expect(receivedEvents[0].0 == "station-1")
        #expect(receivedEvents[0].1 == "track-abc")
        #expect(receivedEvents[0].2 == 5)
    }
    
    @Test("Multiple track added events are received")
    func testMultipleTrackAddedEvents() async {
        let hub = makeMockHub()
        var eventCount = 0
        
        hub.onTrackAdded { _, _, _ in
            eventCount += 1
        }
        
        hub.simulateTrackAdded(stationId: "s1", trackId: "t1", position: 1)
        hub.simulateTrackAdded(stationId: "s1", trackId: "t2", position: 2)
        hub.simulateTrackAdded(stationId: "s1", trackId: "t3", position: 3)
        
        #expect(eventCount == 3)
    }
}
