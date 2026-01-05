import Testing
import Foundation
@testable import Lastream

/// Tests for KeychainHelper.
@Suite("KeychainHelper Tests")
struct KeychainHelperTests {
    
    @Test("Can save and retrieve string")
    func saveAndRetrieveString() throws {
        let key = "test-key-\(UUID().uuidString)"
        let value = "test-value"
        
        try KeychainHelper.save(value, forKey: key)
        let retrieved = KeychainHelper.getString(forKey: key)
        
        #expect(retrieved == value)
        
        // Cleanup
        KeychainHelper.delete(forKey: key)
    }
    
    @Test("Returns nil for non-existent key")
    func returnsNilForNonExistentKey() {
        let key = "non-existent-key-\(UUID().uuidString)"
        let retrieved = KeychainHelper.getString(forKey: key)
        
        #expect(retrieved == nil)
    }
    
    @Test("Can delete key")
    func canDeleteKey() throws {
        let key = "delete-test-key-\(UUID().uuidString)"
        let value = "test-value"
        
        try KeychainHelper.save(value, forKey: key)
        #expect(KeychainHelper.exists(forKey: key) == true)
        
        KeychainHelper.delete(forKey: key)
        #expect(KeychainHelper.exists(forKey: key) == false)
    }
    
    @Test("Exists returns correct value")
    func existsReturnsCorrectValue() throws {
        let key = "exists-test-key-\(UUID().uuidString)"
        
        #expect(KeychainHelper.exists(forKey: key) == false)
        
        try KeychainHelper.save("value", forKey: key)
        #expect(KeychainHelper.exists(forKey: key) == true)
        
        // Cleanup
        KeychainHelper.delete(forKey: key)
    }
    
    @Test("Overwriting key updates value")
    func overwritingKeyUpdatesValue() throws {
        let key = "overwrite-test-key-\(UUID().uuidString)"
        
        try KeychainHelper.save("value1", forKey: key)
        #expect(KeychainHelper.getString(forKey: key) == "value1")
        
        try KeychainHelper.save("value2", forKey: key)
        #expect(KeychainHelper.getString(forKey: key) == "value2")
        
        // Cleanup
        KeychainHelper.delete(forKey: key)
    }
}
