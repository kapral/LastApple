using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class LastfmLibraryStationDefinition : IStationDefinition
{
    public StationType StationType => StationType.LastfmLibrary;

    public string User { get; set; }

    public string Period { get; set; } = "12month";
}