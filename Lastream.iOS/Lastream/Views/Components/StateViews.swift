import SwiftUI

/// A reusable error view component.
struct ErrorView: View {
    let title: String
    let message: String?
    let retryAction: (() -> Void)?
    
    init(
        title: String = "Something went wrong",
        message: String? = nil,
        retryAction: (() -> Void)? = nil
    ) {
        self.title = title
        self.message = message
        self.retryAction = retryAction
    }
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.appWarning)
                .accessibilityHidden(true)
            
            Text(title)
                .font(.headline)
                .foregroundColor(.appText)
                .multilineTextAlignment(.center)
            
            if let message = message {
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.appTextMuted)
                    .multilineTextAlignment(.center)
            }
            
            if let retryAction = retryAction {
                Button("Try Again", action: retryAction)
                    .buttonStyle(.appPrimary)
                    .padding(.top, 8)
            }
        }
        .padding()
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityDescription)
    }
    
    private var accessibilityDescription: String {
        var description = "Error: \(title)"
        if let message = message {
            description += ". \(message)"
        }
        if retryAction != nil {
            description += ". Double tap to try again."
        }
        return description
    }
}

/// A reusable empty state view component.
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String?
    let action: (() -> Void)?
    let actionTitle: String?
    
    init(
        icon: String = "tray",
        title: String,
        message: String? = nil,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.title = title
        self.message = message
        self.actionTitle = actionTitle
        self.action = action
    }
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.appTextMuted)
                .accessibilityHidden(true)
            
            Text(title)
                .font(.headline)
                .foregroundColor(.appText)
                .multilineTextAlignment(.center)
            
            if let message = message {
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.appTextMuted)
                    .multilineTextAlignment(.center)
            }
            
            if let action = action, let actionTitle = actionTitle {
                Button(actionTitle, action: action)
                    .buttonStyle(.appPrimary)
                    .padding(.top, 8)
            }
        }
        .padding()
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityDescription)
    }
    
    private var accessibilityDescription: String {
        var description = title
        if let message = message {
            description += ". \(message)"
        }
        if let actionTitle = actionTitle, action != nil {
            description += ". Double tap to \(actionTitle.lowercased())."
        }
        return description
    }
}

#if DEBUG
#Preview("Error View") {
    ErrorView(
        title: "Failed to load station",
        message: "Check your internet connection and try again.",
        retryAction: {}
    )
    .background(Color.appBackground)
}

#Preview("Empty State") {
    EmptyStateView(
        icon: "music.note.list",
        title: "No tracks in queue",
        message: "Add some music to get started.",
        actionTitle: "Browse Music",
        action: {}
    )
    .background(Color.appBackground)
}
#endif
