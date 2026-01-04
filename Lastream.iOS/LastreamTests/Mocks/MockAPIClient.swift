import Foundation
@testable import Lastream

/// Mock implementation of APIClientProtocol for testing.
final class MockAPIClient: APIClientProtocol, @unchecked Sendable {
    var getHandler: ((String) async throws -> Any)?
    var getStringHandler: ((String) async throws -> String)?
    var postHandler: ((String, Any?) async throws -> Any)?
    var postVoidHandler: ((String) async throws -> Void)?
    var deleteHandler: ((String) async throws -> Void)?
    var deleteWithQueryHandler: ((String, [URLQueryItem]) async throws -> Void)?
    
    // Track calls for verification
    var getCalls: [String] = []
    var postCalls: [(endpoint: String, body: Any?)] = []
    var deleteCalls: [String] = []
    
    func get<T: Decodable>(_ endpoint: String) async throws -> T {
        getCalls.append(endpoint)
        guard let handler = getHandler else {
            throw APIError.invalidResponse
        }
        guard let result = try await handler(endpoint) as? T else {
            throw APIError.invalidResponse
        }
        return result
    }
    
    func getString(_ endpoint: String) async throws -> String {
        getCalls.append(endpoint)
        guard let handler = getStringHandler else {
            throw APIError.invalidResponse
        }
        return try await handler(endpoint)
    }
    
    func post<T: Decodable, B: Encodable>(_ endpoint: String, body: B) async throws -> T {
        postCalls.append((endpoint, body))
        guard let handler = postHandler else {
            throw APIError.invalidResponse
        }
        guard let result = try await handler(endpoint, body) as? T else {
            throw APIError.invalidResponse
        }
        return result
    }
    
    func post<T: Decodable>(_ endpoint: String) async throws -> T {
        postCalls.append((endpoint, nil))
        guard let handler = postHandler else {
            throw APIError.invalidResponse
        }
        guard let result = try await handler(endpoint, nil) as? T else {
            throw APIError.invalidResponse
        }
        return result
    }
    
    func post(_ endpoint: String) async throws {
        postCalls.append((endpoint, nil))
        if let handler = postVoidHandler {
            try await handler(endpoint)
        }
    }
    
    func delete(_ endpoint: String) async throws {
        deleteCalls.append(endpoint)
        if let handler = deleteHandler {
            try await handler(endpoint)
        }
    }
    
    func delete(_ endpoint: String, queryItems: [URLQueryItem]) async throws {
        deleteCalls.append(endpoint)
        if let handler = deleteWithQueryHandler {
            try await handler(endpoint, queryItems)
        }
    }
    
    func reset() {
        getCalls = []
        postCalls = []
        deleteCalls = []
        getHandler = nil
        getStringHandler = nil
        postHandler = nil
        postVoidHandler = nil
        deleteHandler = nil
        deleteWithQueryHandler = nil
    }
}
