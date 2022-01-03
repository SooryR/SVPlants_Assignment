using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace SVPlants_Assignment.Controllers
{
    public class PostInput
    {
        public int plantId { get; set;}
    }

    [ApiController]
    public class PlantInfoController : ControllerBase
    {

        private readonly ILogger<PlantInfoController> _logger;

        public PlantInfoController(ILogger<PlantInfoController> logger)
        {
            _logger = logger;
        }

        private static DateTime[] plantDates = new []
        {
            DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now, DateTime.Now
        };

        [HttpGet]
        [Route("plant")]
        public IEnumerable<PlantInfo> Get()
        {
            return Enumerable.Range(0, 4).Select(index => new PlantInfo
            {
                LastWatered = plantDates[index],
                PlantId = index,
            })
            .ToArray();
        }

        [HttpPost("water")]
        public DateTime Put(PostInput input)
        {
            
            plantDates[input.plantId] = DateTime.Now;
            return plantDates[input.plantId];
        }
    }
}
