using System;
using Microsoft.AspNetCore.Mvc;

namespace LastApple.Controllers
{
    [Route("api/station")]
    public class StationController: Controller
    {
        private readonly IStationRepository _stationRepository;

        public StationController(IStationRepository stationRepository)
        {
            _stationRepository = stationRepository ?? throw new ArgumentNullException(nameof(stationRepository));
        }

        [Route("{stationId}")]
        public ActionResult Get(Guid stationId)
        {
            return Json(_stationRepository.Get(stationId));
        }
    }
}