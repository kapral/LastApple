using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public interface IStationGenerator<TStation> where TStation : IStationDefinition {
    Task Generate(Station<TStation> station, string storefront);

    Task TopUp(Station<TStation> station, string storefront, int count);
}