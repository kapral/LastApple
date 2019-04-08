using LastApple.PlaylistGeneration;

namespace LastApple.Model
{
    public class Station<TDefinition> : StationBase where TDefinition : IStationDefinition
    {
        public TDefinition Definition { get; set; }
    }
}