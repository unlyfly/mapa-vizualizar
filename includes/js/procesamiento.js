// DECLARACION DE VARIABLES GLOBALES

var map2;
var lyrOSM;
var lyrEsri;
var ctrlSidebar;
var ctrlButtonSidebar;
var ctrlSearch;
var objBasemaps;
var arrayColonias = [];
var arrayCapasActivas;
var coloniasLayers;
var wmsLayers;

//  CREACION DE MAPA

$(document).ready(function () {
  map2 = L.map("mapdiv", {
    center: [32.487112, -116.964755],
    zoom: 13,
  });

  // CONTROLES DE SIDE BAR, EN LA IZQUIERDA EL DE CAPAS DISPONIBLES Y EN LA DERECHA EL DE ESTADISTICAS (POR DEFINIR MAS USOS)

  ctrlSidebar = L.control
    .sidebar("consulta-bar", { closeButton: true })
    .addTo(map2);

  ctrlButtonSidebar = L.easyButton({
    position: "topleft",
    states: [
      {
        stateName: "abrirConsulta",
        onClick: function () {
          ctrlSidebar.toggle();
        },
        title: "Abrir Capas de Consulta",
        icon: "fas fa-layer-group",
      },
    ],
  }).addTo(map2);

  // PLUGIN DE INTERCAMBIO DE BASE MAPS
  new L.basemapsSwitcher(
    [
      {
        layer: L.tileLayer(
          "http://mt1.google.com/vt/lyrs=s&hl=pl&x={x}&y={y}&z={z}",
          { attribution: "Google" }
        ).addTo(map2),
        icon: "./assets/img/google_sate_switch.png",
        name: "Google Satelite",
      },
      {
        layer: L.tileLayer(
          "http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
          { attribution: "Google" }
        ),
        icon: "./assets/img/google_roads_switch.png",
        name: "Google Roads",
      },
      {
        layer: L.tileLayer.provider("OpenStreetMap.Mapnik"),
        icon: "./assets/img/osm_switch.png",
        name: "OSM",
      },
      {
        layer: L.tileLayer.provider("Esri.WorldImagery"),
        icon: "./assets/img/esri_switch.png",
        name: "ESRI",
      },
    ],
    { position: "bottomleft" }
  ).addTo(map2);

  objBasemaps = {
    "Open Street Maps": lyrOSM,
    "Esri Imagery": lyrEsri,
  };

    // SE DECLARAN LA CREACION DE LOS LAYER GROUPS DONDE VAMOS A ALMACENAR LOS LAYERS

    wmsLayers = L.layerGroup().addTo(map2);
    coloniasLayers = L.layerGroup().addTo(map2);


  // UBICACION ACTUAL DEL USUARIO
  map2.on("locationfound", function (e) {
    mrkCurrentLocation = L.marker(e.latlng).addTo(map2);
    map2.setView(e.latlng, 16);
  });

  map2.on("locationerror", function (e) {
    console.log(e);
    alert("Lacalizacion no encontrada");
  });
  $("#btnLocate").click(function () {
    map2.locate();
  });
})