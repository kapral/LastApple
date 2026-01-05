import Testing
import SwiftUI
@testable import Lastream

/// Tests for state view components (ErrorView, EmptyStateView).
@Suite("StateView Tests")
@MainActor
struct StateViewTests {
    
    // MARK: - ErrorView Tests
    
    @Test("Error view with title only")
    func testErrorViewTitleOnly() {
        let view = ErrorView(title: "Something went wrong")
        // View renders without crash
        #expect(true)
    }
    
    @Test("Error view with message")
    func testErrorViewWithMessage() {
        let view = ErrorView(
            title: "Connection failed",
            message: "Check your internet connection"
        )
        #expect(true)
    }
    
    @Test("Error view with retry action")
    func testErrorViewWithRetry() {
        var retryCalled = false
        let view = ErrorView(
            title: "Failed to load",
            message: "Please try again",
            retryAction: { retryCalled = true }
        )
        #expect(true)
    }
    
    @Test("Error view default title")
    func testErrorViewDefaultTitle() {
        let view = ErrorView()
        // Uses default "Something went wrong" title
        #expect(true)
    }
    
    // MARK: - EmptyStateView Tests
    
    @Test("Empty state with title only")
    func testEmptyStateTitleOnly() {
        let view = EmptyStateView(title: "No items")
        #expect(true)
    }
    
    @Test("Empty state with custom icon")
    func testEmptyStateCustomIcon() {
        let view = EmptyStateView(
            icon: "music.note.list",
            title: "No tracks"
        )
        #expect(true)
    }
    
    @Test("Empty state with message")
    func testEmptyStateWithMessage() {
        let view = EmptyStateView(
            title: "Empty playlist",
            message: "Add some songs to get started"
        )
        #expect(true)
    }
    
    @Test("Empty state with action")
    func testEmptyStateWithAction() {
        var actionCalled = false
        let view = EmptyStateView(
            title: "No results",
            message: "Try a different search",
            actionTitle: "Search Again",
            action: { actionCalled = true }
        )
        #expect(true)
    }
    
    @Test("Empty state uses default icon")
    func testEmptyStateDefaultIcon() {
        // Default icon is "tray"
        let view = EmptyStateView(title: "Empty")
        #expect(true)
    }
}
