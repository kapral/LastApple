using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Web.Controllers;

[Route("api/station")]
public class StationController(IStationRepository stationRepository) : Controller
{
    private readonly IStationRepository stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));

    [Route("{stationId}")]
    public ActionResult Get(Guid stationId)
    {
        return Json(stationRepository.Get(stationId));
    }

    [HttpDelete]
    [Route("{stationId}/songs")]
    public ActionResult DeleteSongs(Guid stationId, int position, int count)
    {
        var station = stationRepository.Get(stationId);

        if (station == null || station.SongIds.Count < position + count)
            return NotFound();

        for (var i = 0; i < count; i++)
            station.SongIds.RemoveAt(position);

        return NoContent();
    }
}