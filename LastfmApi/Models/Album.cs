namespace LastfmApi.Models
{
    public class Album
    {
        public Album(string title)
        {
            Title = title;
        }

        public string Title { get; }
    }
}