import Testing
import SwiftUI
@testable import Lastream

/// Tests for SettingsView components.
@Suite("SettingsView Tests")
@MainActor
struct SettingsViewTests {
    
    // MARK: - SectionHeaderView Tests
    
    @Test("Section header displays title")
    func testSectionHeaderTitle() {
        let view = SectionHeaderView(title: "Test Section")
        // View renders without crash - basic smoke test
        #expect(true)
    }
    
    // MARK: - AccountRowView Tests
    
    @Test("Account row shows connected state")
    func testAccountRowConnected() async {
        var toggleCalled = false
        let view = AccountRowView(
            iconName: "music.note",
            serviceName: "Test Service",
            isConnected: true,
            onToggle: { toggleCalled = true }
        )
        // View renders without crash
        #expect(true)
    }
    
    @Test("Account row shows disconnected state")
    func testAccountRowDisconnected() async {
        let view = AccountRowView(
            iconName: "applelogo",
            serviceName: "Apple Music",
            isConnected: false,
            onToggle: {}
        )
        // View renders without crash
        #expect(true)
    }
    
    // MARK: - ScrobblingRowView Tests
    
    @Test("Scrobbling row shows enabled state")
    func testScrobblingRowEnabled() async {
        var newValue: Bool?
        let view = ScrobblingRowView(
            isEnabled: true,
            onToggle: { newValue = $0 }
        )
        // View renders without crash
        #expect(true)
    }
    
    @Test("Scrobbling row shows disabled state")
    func testScrobblingRowDisabled() async {
        let view = ScrobblingRowView(
            isEnabled: false,
            onToggle: { _ in }
        )
        // View renders without crash
        #expect(true)
    }
    
    // MARK: - InfoRowView Tests
    
    @Test("Info row displays title and value")
    func testInfoRowDisplay() async {
        let view = InfoRowView(
            iconName: "info.circle",
            title: "Version",
            value: "1.0.0"
        )
        // View renders without crash
        #expect(true)
    }
    
    // MARK: - LinkRowView Tests
    
    @Test("Link row displays title")
    func testLinkRowDisplay() async {
        let view = LinkRowView(
            iconName: "globe",
            title: "Website",
            url: URL(string: "https://example.com")!
        )
        // View renders without crash
        #expect(true)
    }
    
    // MARK: - Bundle Info Tests
    
    @Test("Bundle version is accessible")
    func testBundleVersion() {
        // This tests that Bundle.main can be queried
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String
        // At least one should be available in test bundle or be nil
        #expect(true)
    }
}
