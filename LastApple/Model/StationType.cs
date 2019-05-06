using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace LastApple.Model
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum StationType
    {
        Artists,
        Tags,
        SimilarArtists
    }
}