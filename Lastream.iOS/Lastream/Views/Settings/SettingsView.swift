import SwiftUI

/// Settings view for managing connected accounts and app preferences.
struct SettingsView: View {
    @Environment(AppleMusicAuthService.self) private var appleAuthService
    @Environment(LastfmAuthService.self) private var lastfmAuthService
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if appleAuthService.state == .loading || lastfmAuthService.state == .loading {
                    SpinnerView()
                        .frame(height: 200)
                } else {
                    // Connected Accounts Section
                    connectedAccountsSection
                    
                    // App Info Section
                    appInfoSection
                }
            }
        }
        .background(Color.appBackground)
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    // MARK: - Connected Accounts Section
    
    private var connectedAccountsSection: some View {
        VStack(spacing: 0) {
            SectionHeaderView(title: "Connected accounts")
            
            // Apple Music row
            AccountRowView(
                iconName: "applelogo",
                serviceName: "Apple Music",
                isConnected: appleAuthService.state == .authenticated,
                onToggle: {
                    Task {
                        if appleAuthService.state == .authenticated {
                            try? await appleAuthService.unauthorize()
                        } else {
                            try? await appleAuthService.authorize()
                        }
                    }
                }
            )
            
            // Last.fm row
            AccountRowView(
                iconName: "music.note",
                serviceName: "Last.fm",
                isConnected: lastfmAuthService.isAuthenticated,
                onToggle: {
                    Task {
                        if lastfmAuthService.isAuthenticated {
                            try? await lastfmAuthService.logout()
                        } else {
                            if let url = try? await lastfmAuthService.initiateLogin() {
                                await UIApplication.shared.open(url)
                            }
                        }
                    }
                }
            )
            
            // Scrobbling toggle (only shown when Last.fm is connected)
            if lastfmAuthService.isAuthenticated {
                ScrobblingRowView(
                    isEnabled: lastfmAuthService.isScrobblingEnabled,
                    onToggle: { enabled in
                        lastfmAuthService.setScrobblingEnabled(enabled)
                    }
                )
            }
        }
    }
    
    // MARK: - App Info Section
    
    private var appInfoSection: some View {
        VStack(spacing: 0) {
            SectionHeaderView(title: "About")
            
            InfoRowView(
                iconName: "info.circle",
                title: "Version",
                value: appVersion
            )
            
            InfoRowView(
                iconName: "hammer",
                title: "Build",
                value: buildNumber
            )
            
            LinkRowView(
                iconName: "globe",
                title: "Website",
                url: URL(string: "https://lastream.azurewebsites.net")!
            )
            
            LinkRowView(
                iconName: "doc.text",
                title: "Privacy Policy",
                url: URL(string: "https://lastream.azurewebsites.net/privacy")!
            )
        }
    }
    
    // MARK: - Helpers
    
    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }
    
    private var buildNumber: String {
        Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }
}

/// Section header for settings groups.
struct SectionHeaderView: View {
    let title: String
    
    var body: some View {
        Text(title)
            .font(.subheadline)
            .fontWeight(.medium)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 25)
            .padding(.vertical, 10)
            .background(Color.appSecondaryBackground)
            .foregroundColor(.appText)
    }
}

/// A row displaying an account connection toggle.
struct AccountRowView: View {
    let iconName: String
    let serviceName: String
    let isConnected: Bool
    let onToggle: () -> Void
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: iconName)
                .font(.title2)
                .foregroundColor(.appText)
                .frame(width: 30)
            
            Text(serviceName)
                .foregroundColor(.appText)
            
            Spacer()
            
            Toggle("", isOn: Binding(
                get: { isConnected },
                set: { _ in onToggle() }
            ))
            .labelsHidden()
            .tint(.appAccent)
        }
        .settingsRowStyle()
    }
}

/// A row for the scrobbling toggle.
struct ScrobblingRowView: View {
    let isEnabled: Bool
    let onToggle: (Bool) -> Void
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: "arrow.up.circle")
                .font(.title2)
                .foregroundColor(.appText)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Scrobbling")
                    .foregroundColor(.appText)
                
                Text("Send played tracks to Last.fm")
                    .font(.caption)
                    .foregroundColor(.appTextMuted)
            }
            
            Spacer()
            
            Toggle("", isOn: Binding(
                get: { isEnabled },
                set: { onToggle($0) }
            ))
            .labelsHidden()
            .tint(.appAccent)
        }
        .settingsRowStyle()
    }
}

/// A row displaying static information.
struct InfoRowView: View {
    let iconName: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: iconName)
                .font(.title2)
                .foregroundColor(.appText)
                .frame(width: 30)
            
            Text(title)
                .foregroundColor(.appText)
            
            Spacer()
            
            Text(value)
                .foregroundColor(.appTextMuted)
        }
        .settingsRowStyle()
    }
}

/// A row that opens a link when tapped.
struct LinkRowView: View {
    let iconName: String
    let title: String
    let url: URL
    
    var body: some View {
        Button {
            UIApplication.shared.open(url)
        } label: {
            HStack(spacing: 15) {
                Image(systemName: iconName)
                    .font(.title2)
                    .foregroundColor(.appText)
                    .frame(width: 30)
                
                Text(title)
                    .foregroundColor(.appText)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.appTextMuted)
            }
            .settingsRowStyle()
        }
    }
}

/// Common styling for settings rows.
extension View {
    func settingsRowStyle() -> some View {
        self
            .padding(.horizontal, 20)
            .padding(.vertical, 15)
            .background(Color.appBackground)
            .overlay(
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.appBorder),
                alignment: .bottom
            )
    }
}

#if DEBUG
#Preview {
    NavigationStack {
        SettingsView()
            .environment(PreviewHelpers.makeAppleMusicAuthService())
            .environment(PreviewHelpers.makeLastfmAuthService())
    }
}
#endif
