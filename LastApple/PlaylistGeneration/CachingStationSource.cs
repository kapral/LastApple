using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LastApple.Model;

namespace LastApple.PlaylistGeneration;

public class CachingStationSource<TDefinition> : IStationSource<TDefinition> where TDefinition : IStationDefinition
{
    private readonly IStationSource<TDefinition> concreteSource;
    private readonly ITrackRepository trackRepository;

    private readonly IDictionary<IStationDefinition, CacheItems<Artist>> artists
        = new Dictionary<IStationDefinition, CacheItems<Artist>>();

    public CachingStationSource(IStationSource<TDefinition> concreteSource, ITrackRepository trackRepository)
    {
        this.concreteSource  = concreteSource ?? throw new ArgumentNullException(nameof(concreteSource));
        this.trackRepository = trackRepository ?? throw new ArgumentNullException(nameof(trackRepository));
    }

    public async Task<IReadOnlyCollection<Artist>> GetStationArtists(TDefinition definition)
    {
        if (definition == null) throw new ArgumentNullException(nameof(definition));

        if (artists.TryGetValue(definition, out var cachedArtists) && cachedArtists.Items != null)
            return FilterArtists(cachedArtists.Items);

        cachedArtists       ??= new CacheItems<Artist>();
        artists[definition] =   cachedArtists;

        if (cachedArtists.Attempts >= Constants.MaxRetryAttempts)
            return Array.Empty<Artist>();

        return await LoadArtists(definition, cachedArtists);
    }

    private async Task<IReadOnlyCollection<Artist>> LoadArtists(TDefinition definition, CacheItems<Artist> cachedArtists)
    {
        cachedArtists.Attempts++;

        cachedArtists.Items = await concreteSource.GetStationArtists(definition);

        return FilterArtists(cachedArtists.Items ?? Enumerable.Empty<Artist>());
    }

    private IReadOnlyCollection<Artist> FilterArtists(IEnumerable<Artist> source)
        => source.Where(trackRepository.ArtistHasTracks).ToArray();
}