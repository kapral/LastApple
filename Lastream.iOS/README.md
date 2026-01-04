# Lastream iOS

Native iOS client for Lastream - a music station generator that integrates Apple Music and Last.fm.

## Requirements

- Xcode 16.0+
- iOS 18.0+
- Swift 6.0
- Ruby 3.2+ (for Fastlane)

## Setup

### Clone and Open

```bash
cd Lastream.iOS
open Lastream.xcodeproj
```

### Swift Package Dependencies

The project uses Swift Package Manager for dependencies. Xcode will automatically resolve packages on first open:

- SignalR-Client-Swift: For real-time station updates

### Running the App

1. Select a simulator or connected device
2. Press ⌘+R or click the Run button

### Running Tests

```bash
# Run from Xcode
# Press ⌘+U or select Product > Test

# Run from command line
xcodebuild test \
  -project Lastream.xcodeproj \
  -scheme Lastream \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  CODE_SIGNING_ALLOWED=NO
```

## Project Structure

```
Lastream.iOS/
├── Lastream/
│   ├── LastreamApp.swift         # App entry point
│   ├── Info.plist                # App configuration
│   ├── Lastream.entitlements     # MusicKit entitlements
│   ├── Core/
│   │   ├── Configuration/        # Environment config
│   │   ├── Extensions/           # Swift extensions
│   │   └── Utilities/            # Helper classes
│   ├── Models/                   # Data models
│   ├── Services/                 # API and auth services
│   │   ├── API/                  # Network layer
│   │   └── Authentication/       # Auth services
│   └── Views/                    # SwiftUI views
│       ├── Components/           # Reusable components
│       ├── Home/                 # Home screen
│       ├── Player/               # Station player
│       ├── Settings/             # Settings screen
│       └── Stations/             # Station creation
├── LastreamTests/                # Unit tests
│   ├── Core/                     # Core utility tests
│   ├── Mocks/                    # Mock implementations
│   ├── Models/                   # Model tests
│   └── Services/                 # Service tests
└── LastreamUITests/              # UI tests
```

## Architecture

### MVVM with SwiftUI

The app follows the MVVM pattern using SwiftUI's `@Observable` macro for state management:

- **Views**: SwiftUI views that display UI and respond to user input
- **Services**: Business logic and API communication (observable for state changes)
- **Models**: Data structures matching the backend API

### Dependency Injection

Services are protocol-based to enable:
- Easy mocking for tests
- Swapping implementations
- Clear contracts between components

## Authentication

### Apple Music

Uses MusicKit framework for authorization:
1. Request authorization via `MusicAuthorization.request()`
2. Get music user token
3. Sync with backend via `/api/apple-auth/session-data`

### Last.fm

OAuth-based authentication:
1. Open Last.fm auth URL in browser
2. Handle callback via URL scheme (`lastream://lastfm-callback`)
3. Exchange token for session key
4. Sync with backend

## CI/CD

### GitHub Actions Workflows

- **ios-build.yml**: Builds on push/PR, validates compilation
- **ios-test.yml**: Runs unit tests with code coverage
- **ios-release.yml**: Deploys to TestFlight on version tags

### Fastlane Lanes

```bash
# Run tests locally
fastlane test

# Build and upload to TestFlight
fastlane beta

# Deploy to App Store
fastlane release

# Bump version (patch/minor/major)
fastlane bump_version type:minor
```

## Configuration

### Required GitHub Secrets for CI/CD

For release workflow:
- `APP_STORE_CONNECT_KEY_ID`: App Store Connect API key ID
- `APP_STORE_CONNECT_ISSUER_ID`: App Store Connect issuer ID
- `APP_STORE_CONNECT_KEY_CONTENT`: Base64-encoded API key content
- `MATCH_PASSWORD`: Password for match encryption
- `MATCH_GIT_TOKEN`: Base64-encoded Git credentials for certificates repo

### Environment Variables

For local Fastlane usage:
- `FASTLANE_USER`: Apple ID email
- `FASTLANE_TEAM_ID`: Apple Developer Team ID
- `FASTLANE_ITC_TEAM_ID`: iTunes Connect Team ID
- `MATCH_GIT_URL`: Git repository URL for certificates

## API Integration

The app connects to the same backend as the web frontend:
- Base URL: `https://lastream.azurewebsites.net/`
- SignalR Hub: `/stationHub`
- Session-based authentication

## License

Copyright © 2024
