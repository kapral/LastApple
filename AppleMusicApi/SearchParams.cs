namespace AppleMusicApi
{
    public class SearchParams
    {
        public string Term { get; set; }

        public ResourceType Types { get; set; }

        public int Limit { get; set; }

        public int Offset { get; set; } = 0;
    }
}