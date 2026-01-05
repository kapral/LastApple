import Foundation

/// Represents a Last.fm user.
struct LastfmUser: Codable, Sendable {
    /// The user's Last.fm username.
    let name: String
    
    /// The user's real name, if provided.
    let realName: String?
    
    /// URL to the user's Last.fm profile.
    let url: String?
    
    /// Array of profile images at different sizes.
    let image: [LastfmImage]?
    
    /// The user's playcount.
    let playcount: String?
    
    /// Number of artists in the user's library.
    let artistCount: String?
    
    /// Number of tracks in the user's library.
    let trackCount: String?
    
    /// Number of albums in the user's library.
    let albumCount: String?
    
    /// Returns the largest available profile image URL.
    var imageUrl: String? {
        image?.last?.text
    }
    
    private enum CodingKeys: String, CodingKey {
        case name
        case realName = "realname"
        case url
        case image
        case playcount
        case artistCount = "artist_count"
        case trackCount = "track_count"
        case albumCount = "album_count"
    }
}

/// Represents an image from Last.fm with size information.
struct LastfmImage: Codable, Sendable {
    /// The image URL.
    let text: String
    
    /// The image size (small, medium, large, extralarge).
    let size: String
    
    private enum CodingKeys: String, CodingKey {
        case text = "#text"
        case size
    }
}

/// Represents a Last.fm artist from search results.
struct LastfmArtist: Codable, Sendable, Identifiable {
    /// The artist's name (used as ID).
    var id: String { name }
    
    /// The artist's name.
    let name: String
    
    /// URL to the artist's Last.fm page.
    let url: String?
    
    /// Number of listeners on Last.fm.
    let listeners: String?
}

/// Represents a Last.fm tag from search results.
struct LastfmTag: Codable, Sendable, Identifiable {
    /// The tag name (used as ID).
    var id: String { name }
    
    /// The tag name.
    let name: String
    
    /// Number of times the tag has been used.
    let count: Int?
    
    /// URL to the tag's Last.fm page.
    let url: String?
}
