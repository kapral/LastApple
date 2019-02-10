using System;

namespace LastfmApi.Models
{
    public class Track
    {
        public Track(string name, Artist artist, int? duration)
        {
            Name     = name;
            Artist   = artist ?? throw new ArgumentNullException(nameof(artist));
            Duration = TimeSpan.FromSeconds(duration.GetValueOrDefault());
        }

        public string Name { get; }

        public Artist Artist { get; }

        public TimeSpan Duration { get; }
    }
}