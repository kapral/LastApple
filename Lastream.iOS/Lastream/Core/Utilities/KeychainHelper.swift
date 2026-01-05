import Foundation
import Security

/// A helper for securely storing and retrieving sensitive data in the iOS Keychain.
///
/// Use this for storing authentication tokens, session keys, and other sensitive data
/// that should persist across app launches but remain secure.
enum KeychainHelper {
    
    /// Errors that can occur during Keychain operations.
    enum KeychainError: Error, LocalizedError {
        case duplicateItem
        case itemNotFound
        case unexpectedStatus(OSStatus)
        case invalidData
        
        var errorDescription: String? {
            switch self {
            case .duplicateItem:
                return "Item already exists in Keychain"
            case .itemNotFound:
                return "Item not found in Keychain"
            case .unexpectedStatus(let status):
                return "Keychain error: \(status)"
            case .invalidData:
                return "Invalid data format"
            }
        }
    }
    
    private static let service = "com.lastapple.lastapple"
    
    /// Saves a string value to the Keychain.
    /// - Parameters:
    ///   - value: The string value to save.
    ///   - key: The key to associate with the value.
    /// - Throws: `KeychainError` if the operation fails.
    static func save(_ value: String, forKey key: String) throws {
        guard let data = value.data(using: .utf8) else {
            throw KeychainError.invalidData
        }
        try save(data, forKey: key)
    }
    
    /// Saves data to the Keychain.
    /// - Parameters:
    ///   - data: The data to save.
    ///   - key: The key to associate with the data.
    /// - Throws: `KeychainError` if the operation fails.
    static func save(_ data: Data, forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        
        // Try to delete existing item first
        SecItemDelete(query as CFDictionary)
        
        let status = SecItemAdd(query as CFDictionary, nil)
        
        guard status == errSecSuccess else {
            throw KeychainError.unexpectedStatus(status)
        }
    }
    
    /// Retrieves a string value from the Keychain.
    /// - Parameter key: The key associated with the value.
    /// - Returns: The string value, or nil if not found.
    static func getString(forKey key: String) -> String? {
        guard let data = getData(forKey: key) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }
    
    /// Retrieves data from the Keychain.
    /// - Parameter key: The key associated with the data.
    /// - Returns: The data, or nil if not found.
    static func getData(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess else {
            return nil
        }
        
        return result as? Data
    }
    
    /// Deletes an item from the Keychain.
    /// - Parameter key: The key associated with the item to delete.
    static func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
    
    /// Checks if an item exists in the Keychain.
    /// - Parameter key: The key to check.
    /// - Returns: True if the item exists, false otherwise.
    static func exists(forKey key: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: false
        ]
        
        let status = SecItemCopyMatching(query as CFDictionary, nil)
        return status == errSecSuccess
    }
}

// MARK: - Keychain Keys

extension KeychainHelper {
    /// Keys used for storing values in the Keychain.
    enum Key {
        static let sessionId = "sessionId"
        static let lastfmSessionKey = "lastfmSessionKey"
        static let musicUserToken = "musicUserToken"
    }
}
