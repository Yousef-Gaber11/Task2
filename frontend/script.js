require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/VectorTileLayer",
], function (Map, MapView, VectorTileLayer) {
  const urlParams = new URLSearchParams(window.location.search);
  const x = parseFloat(urlParams.get("x")) || 46.6842152;
  const y = parseFloat(urlParams.get("y")) || 24.7976198;

  const vtlLayer = new VectorTileLayer({
    url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_GCS_v2/VectorTileServer",
  });

  const map = new Map({ layers: [vtlLayer] });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [x, y],
    zoom: 15,
    ui: { components: [] },
  });

  view.when(() => {
    view.on("layerview-create", (event) => {
      setTimeout(() => {
        console.log("MAP_READY");
      }, 1500);
    });
  });
});
