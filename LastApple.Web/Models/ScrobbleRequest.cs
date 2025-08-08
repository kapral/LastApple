namespace LastApple.Web.Models;

public class ScrobbleRequest
{
    public string Artist { get; set; } = string.Empty;
    public string Song { get; set; } = string.Empty;
    public string? Album { get; set; }
    public int? DurationInMillis { get; set; }
}