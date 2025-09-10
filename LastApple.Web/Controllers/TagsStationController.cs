using System;
using System.Threading.Tasks;
using LastApple.Model;
using LastApple.PlaylistGeneration;
using LastApple.Web.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station/tags")]
public class TagsStationController(IStationRepository stationRepository,
                                   IStationGenerator<TagsStationDefinition> stationGenerator,
                                   IBackgroundProcessManager backgroundProcessManager,
                                   IStorefrontProvider storefrontProvider) : Controller
{
    [HttpPost]
    [Route("{tag}")]
    public async Task<Station<TagsStationDefinition>> Create(string tag)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tag);

        var definition = new TagsStationDefinition([tag]);
        var station = new Station<TagsStationDefinition>(definition)
        {
            IsContinuous = true,
            Id = Guid.NewGuid()
        };

        stationRepository.Create(station);

        var storefront = await storefrontProvider.GetStorefront();
        backgroundProcessManager.AddProcess(() => stationGenerator.Generate(station, storefront));

        return station;
    }

    [HttpPost]
    [Route("{stationId}/topup/{count}")]
    public async Task TopUp(Guid stationId, int count)
    {
        if (stationRepository.Get(stationId) is not Station<TagsStationDefinition> station)
        {
            throw new NotFoundException();
        }

        var storefront = await storefrontProvider.GetStorefront();
        backgroundProcessManager.AddProcess(() => stationGenerator.TopUp(station, storefront, count));
    }
}