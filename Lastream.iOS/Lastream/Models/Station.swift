import Foundation

/// Represents a music station with a collection of songs.
struct Station: Codable, Identifiable, Sendable {
    /// Unique identifier for the station.
    let id: String
    
    /// List of Apple Music song IDs in the station.
    var songIds: [String]
    
    /// Whether the station continuously generates new tracks.
    let isContinuous: Bool
    
    /// Whether tracks should be grouped by album in the UI.
    let isGroupedByAlbum: Bool
    
    /// The total number of songs in the station.
    let size: Int
    
    /// The definition describing how the station was created.
    let definition: StationDefinition
    
    /// Convenience property to get the station type as an enum.
    var stationType: StationType? {
        StationType(rawValue: definition.stationType)
    }
}

/// Describes the type and parameters of a station.
struct StationDefinition: Codable, Sendable {
    /// The type of station (e.g., "artist", "similarartists", "tags", "lastfmlibrary").
    let stationType: String
    
    /// Additional properties depending on station type.
    /// For artist stations: contains artist IDs
    /// For similar artists: contains the seed artist name
    /// For tags: contains the tag name
    /// For library: contains the Last.fm username
    let artists: [String]?
    let artist: String?
    let tag: String?
    let user: String?
    
    init(stationType: String, artists: [String]? = nil, artist: String? = nil, tag: String? = nil, user: String? = nil) {
        self.stationType = stationType
        self.artists = artists
        self.artist = artist
        self.tag = tag
        self.user = user
    }
}

/// The type of station.
enum StationType: String, Codable, Sendable {
    case artist
    case similarartists
    case tags
    case lastfmlibrary
    
    /// Human-readable title for the station type.
    var title: String {
        switch self {
        case .artist:
            return "Artist"
        case .similarartists:
            return "Similar Artists"
        case .tags:
            return "Tag"
        case .lastfmlibrary:
            return "My last.fm Library"
        }
    }
    
    /// Description of what this station type does.
    var description: String {
        switch self {
        case .artist:
            return "Play all tracks of one artist."
        case .similarartists:
            return "A station based on artists similar to your pick."
        case .tags:
            return "A station based on a genre or mood tag."
        case .lastfmlibrary:
            return "A continuous station based on your last.fm library."
        }
    }
}
