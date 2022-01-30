using System.Text.Json.Serialization;

namespace LastApple.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum StationType
{
    Artists,
    Tags,
    SimilarArtists,
    LastfmLibrary
}