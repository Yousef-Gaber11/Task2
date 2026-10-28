require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/VectorTileLayer",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
], function (Map, MapView, VectorTileLayer, Graphic, GraphicsLayer) {
  const vtlLayer = new VectorTileLayer({
    url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer",
  });

  const map = new Map({ layers: [vtlLayer] });
  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [46.6842, 24.7976],
    zoom: 12,
  });

  const xInput = document.getElementById("xInput");
  const yInput = document.getElementById("yInput");
  const btnLocate = document.getElementById("btnLocate");
  const btnCapture = document.getElementById("btnCapture");
  const btnClear = document.getElementById("btnClear");
  const resultBox = document.getElementById("resultBox");
  const imageLink = document.getElementById("imageLink");
  const statusAlert = document.getElementById("statusAlert");

  function showStatus(message, type = "info") {
    statusAlert.innerText = message;
    statusAlert.className = `status-alert status-${type}`;
    statusAlert.classList.remove("hidden");
  }

  function hideStatus() {
    statusAlert.classList.add("hidden");
    statusAlert.innerText = "";
  }

  function updateMapPoint(x, y) {
    graphicsLayer.removeAll();
    const point = { type: "point", longitude: x, latitude: y };
    const markerSymbol = {
      type: "picture-marker",
      url: "icon/mark.png",
      width: "32px",
      height: "32px",
    };

    const pointGraphic = new Graphic({ geometry: point, symbol: markerSymbol });
    graphicsLayer.add(pointGraphic);

    view.goTo(
      {
        center: [x, y],
        zoom: 15,
      },
      {
        duration: 1200,
        easing: "ease-in-out",
      },
    );
  }

  btnLocate.addEventListener("click", () => {
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);

    if (!x || !y) {
      showStatus("يرجى ادخال الإحداثيات (X و Y)", "error");
      return;
    }

    updateMapPoint(x, y);
    showStatus("تم تحديد النقطة على الخريطة بنجاح", "info");
    resultBox.classList.add("hidden");
  });

  view.on("click", function (event) {
    const lon = Math.round(event.mapPoint.longitude * 100000) / 100000;
    const lat = Math.round(event.mapPoint.latitude * 100000) / 100000;

    xInput.value = lon;
    yInput.value = lat;

    updateMapPoint(lon, lat);
    showStatus("تم التقاط الإحداثيات من الخريطة", "info");
    resultBox.classList.add("hidden");
  });

  btnClear.addEventListener("click", () => {
    xInput.value = "";
    yInput.value = "";
    graphicsLayer.removeAll();
    resultBox.classList.add("hidden");
    showStatus("تم مسح الإحداثيات وتنظيف الخريطة", "info");
  });

  btnCapture.addEventListener("click", async () => {
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);

    if (!x || !y) {
      showStatus("الرجاء تحديد نقطة قبل الالتقاط", "error");
      return;
    }

    btnCapture.disabled = true;
    btnCapture.innerText = "جاري الالتقاط...";
    showStatus("جاري معالجة الخريطة والتقاط الصورة...", "warning");
    resultBox.classList.add("hidden");

    try {
      const response = await fetch(
        `https://localhost:7035/api/QueryData/GetPointShot?x=${x}&y=${y}`,
      );
      const data = await response.json();

      if (data.status) {
        showStatus("تم التقاط الصورة وحفظ البيانات بنجاح", "success");
        resultBox.classList.remove("hidden");
        imageLink.href = data.imageUrl;
      }
    } catch (error) {
      console.error("Error:", error);
      showStatus("حدث خطأ في الاتصال بالخادم. تأكد من تشغيل الـ API", "error");
    } finally {
      btnCapture.disabled = false;
      btnCapture.innerText = "التقط صورة";
    }
  });
});
