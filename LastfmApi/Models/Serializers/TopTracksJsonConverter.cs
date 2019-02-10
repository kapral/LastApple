using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace LastfmApi.Models.Serializers
{
    public class TopTracksJsonConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotSupportedException();
        }

        public override object ReadJson(JsonReader reader, Type objectType,
            object existingValue,
            JsonSerializer serializer)
        {
            if (reader.TokenType == JsonToken.StartArray)
            {
                return serializer.Deserialize<Track[]>(reader);
            }

            var track = serializer.Deserialize<Track>(reader);
            return new[] { track };
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(IEnumerable<Track>);
        }
    }
}