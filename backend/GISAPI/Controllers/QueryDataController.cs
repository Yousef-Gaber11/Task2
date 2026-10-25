using Microsoft.AspNetCore.Mvc;
using PuppeteerSharp;
using System.IO;
using System.Threading.Tasks;

namespace GISAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QueryDataController : ControllerBase
    {
        [HttpGet("GetPointShot")]
        public async Task<IActionResult> GetPointShot(double x, double y)
        {
            string fileName = $"snapshot_{x}_{y}.jpg";
            string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);

            //Chromium
            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync();

            using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });
            using var page = await browser.NewPageAsync();

            await page.SetViewportAsync(new ViewPortOptions { Width = 1000, Height = 700 });

            string frontendHtmlPath = @"D:\Github_Repos\Task2\frontend\index.html";
            string fileUrl = $"file:///{frontendHtmlPath.Replace("\\", "/")}?x={x}&y={y}";

            var tcs = new TaskCompletionSource<bool>();
            page.Console += (sender, e) =>
            {
                if (e.Message.Text == "MAP_READY") tcs.TrySetResult(true);
            };

            await page.GoToAsync(fileUrl);
            await Task.WhenAny(tcs.Task, Task.Delay(15000));

            await page.ScreenshotAsync(imagePath, new ScreenshotOptions { Type = ScreenshotType.Jpeg, Quality = 90 });

            string baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            string finalImageUrl = $"{baseUrl}/images/{fileName}";

            return Ok(new
            {
                status = true,
                errorCode = 0,
                error_Code = (object?)null,
                gis_code = "Done",
                imageUrl = finalImageUrl,
                urlEsri = "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer"
            });
        }
    }
}