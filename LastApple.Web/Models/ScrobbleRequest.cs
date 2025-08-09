namespace LastApple.Web.Models;

public record ScrobbleRequest(
    string Artist = "",
    string Song = "",
    string Album = "",
    int DurationInMillis = 180000); // 3 minutes default