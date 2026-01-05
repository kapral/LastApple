import Foundation
import SignalRClient
import Observation

/// Protocol for SignalR station hub operations.
@MainActor
protocol StationHubServiceProtocol: AnyObject {
    /// Whether the connection is currently active.
    var isConnected: Bool { get }
    
    /// The current station ID being listened to.
    var currentStationId: String? { get }
    
    /// Connects to the SignalR hub.
    func connect() async throws
    
    /// Disconnects from the SignalR hub.
    func disconnect() async
    
    /// Subscribes to events for a specific station.
    func subscribeToStation(id: String)
    
    /// Unsubscribes from the current station.
    func unsubscribeFromStation()
    
    /// Sets the handler for track added events.
    func onTrackAdded(_ handler: @escaping (String, String, Int) -> Void)
}

/// Event sent when a track is added to a station.
struct TrackAddedEvent: Sendable {
    let stationId: String
    let trackId: String
    let position: Int
}

/// Service for managing SignalR connection to the station hub.
@Observable
@MainActor
final class StationHubService: StationHubServiceProtocol {
    /// Shared instance.
    static let shared = StationHubService()
    
    /// Whether the connection is currently active.
    private(set) var isConnected: Bool = false
    
    /// The current station ID being listened to.
    private(set) var currentStationId: String?
    
    /// Connection state for UI display.
    enum ConnectionState: Sendable {
        case disconnected
        case connecting
        case connected
        case reconnecting
        case failed(Error)
    }
    
    private(set) var connectionState: ConnectionState = .disconnected
    
    private var hubConnection: HubConnection?
    private var trackAddedHandler: ((String, String, Int) -> Void)?
    
    private init() {}
    
    // MARK: - Connection Management
    
    func connect() async throws {
        guard hubConnection == nil else { return }
        
        connectionState = .connecting
        
        let hubURL = AppEnvironment.hubURL
        
        hubConnection = HubConnectionBuilder(url: hubURL)
            .withLogging(minLogLevel: .error)
            .withAutoReconnect()
            .build()
        
        setupEventHandlers()
        
        // Start connection using async/await wrapper
        try await startConnection()
        
        isConnected = true
        connectionState = .connected
    }
    
    private func startConnection() async throws {
        guard let connection = hubConnection else {
            throw SignalRError.connectionNotStarted
        }
        
        // The SignalR library uses callback-based connection
        // We'll just start and assume success after a delay
        // The library will handle reconnection automatically
        connection.start()
        
        // Wait for connection to establish
        try await Task.sleep(for: .seconds(1))
    }
    
    func disconnect() async {
        guard let connection = hubConnection else { return }
        
        connection.stop()
        
        hubConnection = nil
        isConnected = false
        connectionState = .disconnected
        currentStationId = nil
    }
    
    // MARK: - Station Subscription
    
    func subscribeToStation(id: String) {
        currentStationId = id
        // The backend broadcasts to all clients, so we just need to track
        // which station we're interested in locally
    }
    
    func unsubscribeFromStation() {
        currentStationId = nil
    }
    
    // MARK: - Event Handlers
    
    func onTrackAdded(_ handler: @escaping (String, String, Int) -> Void) {
        trackAddedHandler = handler
    }
    
    private func setupEventHandlers() {
        // Handle trackAdded events from the server
        // Server sends: stationId (Guid as String), trackId (String), position (Int)
        hubConnection?.on(method: "trackAdded", callback: { [weak self] (stationId: String, trackId: String, position: Int) in
            Task { @MainActor in
                guard let self = self else { return }
                
                // Only process events for our subscribed station
                if let currentId = self.currentStationId,
                   stationId.lowercased() == currentId.lowercased() {
                    self.trackAddedHandler?(stationId, trackId, position)
                }
            }
        })
    }
}

/// Errors for SignalR operations.
enum SignalRError: Error, LocalizedError {
    case connectionNotStarted
    case connectionFailed
    case timeout
    
    var errorDescription: String? {
        switch self {
        case .connectionNotStarted:
            return "SignalR connection not initialized"
        case .connectionFailed:
            return "Failed to connect to SignalR hub"
        case .timeout:
            return "SignalR connection timed out"
        }
    }
}
