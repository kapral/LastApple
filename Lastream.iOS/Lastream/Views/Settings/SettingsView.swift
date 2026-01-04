import SwiftUI

/// Settings view for managing connected accounts.
struct SettingsView: View {
    @Environment(AppleMusicAuthService.self) private var appleAuthService
    @Environment(LastfmAuthService.self) private var lastfmAuthService
    
    var body: some View {
        VStack(spacing: 0) {
            if appleAuthService.state == .loading || lastfmAuthService.state == .loading {
                SpinnerView()
                    .frame(height: 200)
            } else {
                VStack(spacing: 0) {
                    // Section header
                    Text("Connected accounts")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 25)
                        .padding(.vertical, 10)
                        .background(Color.appSecondaryBackground)
                        .foregroundColor(.appText)
                    
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
            
            Spacer()
        }
        .background(Color.appBackground)
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
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
