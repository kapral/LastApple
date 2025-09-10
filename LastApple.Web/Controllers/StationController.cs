using System;
using LastApple.Model;
using LastApple.Web.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station")]
public class StationController(IStationRepository stationRepository) : Controller
{
    [Route("{stationId}")]
    public StationBase? Get(Guid stationId) => stationRepository.Get(stationId);

    [HttpDelete]
    [Route("{stationId}/songs")]
    public void DeleteSongs(Guid stationId, int position, int count)
    {
        var station = stationRepository.Get(stationId);

        if (station == null || station.SongIds.Count < position + count)
        {
            throw new NotFoundException();
        }

        for (var i = 0; i < count; i++)
        {
            station.SongIds.RemoveAt(position);
        }
    }
}