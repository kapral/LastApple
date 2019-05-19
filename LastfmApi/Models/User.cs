using System.Collections.Generic;

namespace LastfmApi.Models
{
    public class User
    {
        public string Name { get; set; }

        public string Url { get; set; }

        public IEnumerable<Image> Image { get; set; }
    }
}