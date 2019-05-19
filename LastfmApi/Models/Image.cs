using Newtonsoft.Json;

namespace LastfmApi.Models
{
    public class Image
    {
        public string Size { get; set; }

        public string Url => UrlText;

        [JsonProperty("#text")]
        public string UrlText { get; set; }
    }
}