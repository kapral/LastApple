using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public record LastfmLibraryStationDefinition(string User, string Period = "12month") : IStationDefinition
{
    public StationType StationType => StationType.LastfmLibrary;
}