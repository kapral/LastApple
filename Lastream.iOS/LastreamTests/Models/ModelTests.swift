import Testing
import Foundation
@testable import Lastream

/// Tests for Station model.
@Suite("Station Model Tests")
struct StationTests {
    
    @Test("Station decodes from JSON correctly")
    func stationDecodesFromJSON() throws {
        let json = """
        {
            "id": "test-station-id",
            "songIds": ["song1", "song2", "song3"],
            "isContinuous": true,
            "isGroupedByAlbum": false,
            "size": 3,
            "definition": {
                "stationType": "lastfmlibrary"
            }
        }
        """.data(using: .utf8)!
        
        let decoder = JSONDecoder()
        let station = try decoder.decode(Station.self, from: json)
        
        #expect(station.id == "test-station-id")
        #expect(station.songIds.count == 3)
        #expect(station.isContinuous == true)
        #expect(station.isGroupedByAlbum == false)
        #expect(station.size == 3)
        #expect(station.definition.stationType == "lastfmlibrary")
    }
    
    @Test("StationType has correct titles")
    func stationTypeHasCorrectTitles() {
        #expect(StationType.artist.title == "Artist")
        #expect(StationType.similarartists.title == "Similar Artists")
        #expect(StationType.tags.title == "Tag")
        #expect(StationType.lastfmlibrary.title == "My last.fm Library")
    }
    
    @Test("StationType has correct descriptions")
    func stationTypeHasCorrectDescriptions() {
        #expect(StationType.artist.description.contains("tracks"))
        #expect(StationType.similarartists.description.contains("similar"))
        #expect(StationType.tags.description.contains("genre"))
        #expect(StationType.lastfmlibrary.description.contains("library"))
    }
}

/// Tests for Session model.
@Suite("Session Model Tests")
struct SessionTests {
    
    @Test("Session decodes from JSON correctly")
    func sessionDecodesFromJSON() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "startedAt": "2024-01-01T00:00:00Z",
            "lastActivityAt": "2024-01-01T12:00:00Z",
            "lastfmSessionKey": "key123",
            "lastfmUsername": "testuser",
            "musicUserToken": "token456",
            "musicStorefrontId": "us"
        }
        """.data(using: .utf8)!
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let session = try decoder.decode(Session.self, from: json)
        
        #expect(session.id?.uuidString == "550E8400-E29B-41D4-A716-446655440000")
        #expect(session.lastfmSessionKey == "key123")
        #expect(session.lastfmUsername == "testuser")
        #expect(session.musicUserToken == "token456")
        #expect(session.musicStorefrontId == "us")
    }
    
    @Test("Session hasAppleMusicAuth returns correct value")
    func sessionHasAppleMusicAuth() {
        let sessionWithAuth = Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: "token",
            musicStorefrontId: "us"
        )
        #expect(sessionWithAuth.hasAppleMusicAuth == true)
        
        let sessionWithoutAuth = Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: nil,
            musicStorefrontId: nil
        )
        #expect(sessionWithoutAuth.hasAppleMusicAuth == false)
    }
    
    @Test("Session hasLastfmAuth returns correct value")
    func sessionHasLastfmAuth() {
        let sessionWithAuth = Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: "key",
            lastfmUsername: "user",
            musicUserToken: nil,
            musicStorefrontId: nil
        )
        #expect(sessionWithAuth.hasLastfmAuth == true)
        
        let sessionWithoutAuth = Session(
            id: UUID(),
            startedAt: Date(),
            lastActivityAt: Date(),
            lastfmSessionKey: nil,
            lastfmUsername: nil,
            musicUserToken: nil,
            musicStorefrontId: nil
        )
        #expect(sessionWithoutAuth.hasLastfmAuth == false)
    }
}

/// Tests for LastfmUser model.
@Suite("LastfmUser Model Tests")
struct LastfmUserTests {
    
    @Test("LastfmUser decodes from JSON correctly")
    func lastfmUserDecodesFromJSON() throws {
        let json = """
        {
            "name": "testuser",
            "realname": "Test User",
            "url": "https://last.fm/user/testuser",
            "image": [
                {"#text": "small.jpg", "size": "small"},
                {"#text": "medium.jpg", "size": "medium"},
                {"#text": "large.jpg", "size": "large"}
            ],
            "playcount": "12345"
        }
        """.data(using: .utf8)!
        
        let decoder = JSONDecoder()
        let user = try decoder.decode(LastfmUser.self, from: json)
        
        #expect(user.name == "testuser")
        #expect(user.realName == "Test User")
        #expect(user.url == "https://last.fm/user/testuser")
        #expect(user.image?.count == 3)
        #expect(user.playcount == "12345")
    }
    
    @Test("LastfmUser imageUrl returns largest image")
    func lastfmUserImageUrlReturnsLargest() {
        let user = LastfmUser(
            name: "test",
            realName: nil,
            url: nil,
            image: [
                LastfmImage(text: "small.jpg", size: "small"),
                LastfmImage(text: "large.jpg", size: "large")
            ],
            playcount: nil,
            artistCount: nil,
            trackCount: nil,
            albumCount: nil
        )
        
        #expect(user.imageUrl == "large.jpg")
    }
}
