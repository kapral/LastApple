namespace LastfmApi.Models
{
    public class TrackInfo
    {
        public TrackInfo(string name, Album album, Artist artist)
        {
            Name   = name;
            Album  = album;
            Artist = artist;
        }

        public string Name { get; }

        public Artist Artist { get; }

        public Album Album { get; }
    }
}