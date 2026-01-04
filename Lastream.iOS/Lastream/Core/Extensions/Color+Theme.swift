import SwiftUI

/// Theme colors matching the Lastream web application.
///
/// These colors are based on the web app's CSS styling to maintain
/// visual consistency across platforms.
extension Color {
    /// Main background color (#222222)
    static let appBackground = Color(hex: "#222222")
    
    /// Primary text color (#CCCCCC)
    static let appText = Color(hex: "#CCCCCC")
    
    /// Secondary/darker background color (#0E0E0E)
    static let appSecondaryBackground = Color(hex: "#0E0E0E")
    
    /// Border color (#333333)
    static let appBorder = Color(hex: "#333333")
    
    /// Warning/highlight color (#FFC123)
    static let appWarning = Color(hex: "#FFC123")
    
    /// Accent color - Apple Music red (#FA243C)
    static let appAccent = Color(hex: "#FA243C")
    
    /// Success/enabled state color
    static let appSuccess = Color(hex: "#34C759")
    
    /// Muted text color for secondary information
    static let appTextMuted = Color(hex: "#888888")
}

// MARK: - Hex Color Initializer

extension Color {
    /// Creates a Color from a hex string.
    /// - Parameter hex: A hex color string (e.g., "#FF0000" or "FF0000")
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - ShapeStyle Extension

extension ShapeStyle where Self == Color {
    static var appBackground: Color { .appBackground }
    static var appText: Color { .appText }
    static var appSecondaryBackground: Color { .appSecondaryBackground }
    static var appBorder: Color { .appBorder }
    static var appWarning: Color { .appWarning }
    static var appAccent: Color { .appAccent }
}
