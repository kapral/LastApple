import Foundation

/// Errors that can occur during API requests.
enum APIError: Error, LocalizedError, Sendable {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int, message: String?)
    case decodingError(Error)
    case encodingError(Error)
    case networkError(Error)
    case unauthorized
    case notFound
    case serverError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let statusCode, let message):
            return message ?? "HTTP error: \(statusCode)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .encodingError(let error):
            return "Failed to encode request: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized"
        case .notFound:
            return "Resource not found"
        case .serverError:
            return "Server error"
        }
    }
}

/// Protocol for API client implementations.
/// Enables dependency injection and mocking for tests.
protocol APIClientProtocol: Sendable {
    /// Performs a GET request.
    func get<T: Decodable>(_ endpoint: String) async throws -> T
    
    /// Performs a GET request that returns a raw string.
    func getString(_ endpoint: String) async throws -> String
    
    /// Performs a POST request with a JSON body.
    func post<T: Decodable, B: Encodable>(_ endpoint: String, body: B) async throws -> T
    
    /// Performs a POST request without a body.
    func post<T: Decodable>(_ endpoint: String) async throws -> T
    
    /// Performs a POST request that doesn't expect a response body.
    func post(_ endpoint: String) async throws
    
    /// Performs a DELETE request.
    func delete(_ endpoint: String) async throws
    
    /// Performs a DELETE request with query parameters.
    func delete(_ endpoint: String, queryItems: [URLQueryItem]) async throws
}

/// HTTP client for communicating with the Lastream backend API.
final class APIClient: APIClientProtocol, @unchecked Sendable {
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    /// The session ID header key.
    private static let sessionIdHeader = "X-SessionId"
    
    /// Creates a new API client.
    /// - Parameters:
    ///   - baseURL: The base URL for API requests. Defaults to the production API.
    ///   - session: The URL session to use. Defaults to shared session.
    init(baseURL: URL = AppEnvironment.apiURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
        
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }
    
    // MARK: - Session Management
    
    /// The current session ID, stored in UserDefaults.
    var sessionId: String? {
        get { UserDefaults.standard.string(forKey: "SessionId") }
        set {
            if let value = newValue {
                UserDefaults.standard.set(value, forKey: "SessionId")
            } else {
                UserDefaults.standard.removeObject(forKey: "SessionId")
            }
        }
    }
    
    // MARK: - APIClientProtocol
    
    func get<T: Decodable>(_ endpoint: String) async throws -> T {
        let request = try makeRequest(endpoint: endpoint, method: "GET")
        return try await performRequest(request)
    }
    
    func getString(_ endpoint: String) async throws -> String {
        let request = try makeRequest(endpoint: endpoint, method: "GET")
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        // Handle quoted string response (JSON string)
        if let jsonString = try? decoder.decode(String.self, from: data) {
            return jsonString
        }
        
        // Fallback to raw string
        guard let string = String(data: data, encoding: .utf8) else {
            throw APIError.invalidResponse
        }
        return string
    }
    
    func post<T: Decodable, B: Encodable>(_ endpoint: String, body: B) async throws -> T {
        var request = try makeRequest(endpoint: endpoint, method: "POST")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try encoder.encode(body)
        } catch {
            throw APIError.encodingError(error)
        }
        
        return try await performRequest(request)
    }
    
    func post<T: Decodable>(_ endpoint: String) async throws -> T {
        let request = try makeRequest(endpoint: endpoint, method: "POST")
        return try await performRequest(request)
    }
    
    func post(_ endpoint: String) async throws {
        let request = try makeRequest(endpoint: endpoint, method: "POST")
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }
    
    func delete(_ endpoint: String) async throws {
        let request = try makeRequest(endpoint: endpoint, method: "DELETE")
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }
    
    func delete(_ endpoint: String, queryItems: [URLQueryItem]) async throws {
        let request = try makeRequest(endpoint: endpoint, method: "DELETE", queryItems: queryItems)
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }
    
    // MARK: - Private Helpers
    
    private func makeRequest(endpoint: String, method: String, queryItems: [URLQueryItem]? = nil) throws -> URLRequest {
        var urlComponents = URLComponents(url: baseURL.appendingPathComponent(endpoint), resolvingAgainstBaseURL: true)
        
        if let queryItems = queryItems, !queryItems.isEmpty {
            urlComponents?.queryItems = queryItems
        }
        
        guard let url = urlComponents?.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        // Add session ID header if available
        if let sessionId = sessionId {
            request.setValue(sessionId, forHTTPHeaderField: Self.sessionIdHeader)
        }
        
        return request
    }
    
    private func performRequest<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await performDataRequest(request)
        
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }
    
    private func performDataRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        do {
            let (data, response) = try await session.data(for: request)
            try validateResponse(response)
            return (data, response)
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
    
    private func validateResponse(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        switch httpResponse.statusCode {
        case 200...299:
            return
        case 401:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        case 500...599:
            throw APIError.serverError
        default:
            throw APIError.httpError(statusCode: httpResponse.statusCode, message: nil)
        }
    }
}
