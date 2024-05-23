// Define la URL de tu solicitud GetCapabilities de GeoServer
var geoServerUrl =
  "https://www.clustersig.com/geoserver/ows?service=WFS&version=2.0.0&request=GetCapabilities";

var baseLyrGroup = L.layerGroup();
var selectedPolygons;
var selectedLayerInfo;

getLayerNamesFromGeoServer(geoServerUrl)
  .then((typeNS) => {
    var layersList = document.getElementById("layerSelects");
    var layersBase;

    typeNS.forEach((element) => {
      //CREACION DE ELEMENTOS PARA INTEGRAR EN LISTA DE CAPAS EN EL SIDEBAR
      var grupo = document.createElement("li");
      var button = document.createElement("button");
      var divSwitches = document.createElement("div");
      var dropdownCont = document.createElement("div");

      // SEPARACION DE LOS NOMBRES DE LAS DEPENDENCIAS Y LOS NOMBRES DE LAS CAPAS
      var nomSeparado = element.split(":");
      var nomDependecia = nomSeparado[0].split("_")[0];
      var nomDependeciaFix =
        nomDependecia.charAt(0).toUpperCase() + nomDependecia.slice(1);

      var nomGrupo = nomSeparado[0];
      var nomCapa = nomSeparado[1];
      var nomCapaFix = nomCapa.charAt(0).toUpperCase() + nomCapa.slice(1);

      grupo.id = "grupo" + nomDependeciaFix;
      grupo.classList.add(
        "form-control",
        "list-group-item",
        "list-group-item-action"
      );

      button.innerHTML =
        nomDependecia.toUpperCase() + "<i class='fa fa-caret-down'></i>";
      button.id = "lista" + nomDependeciaFix;
      button.classList.add("dropdown-btn");

      dropdownCont.id = "container" + nomDependeciaFix;
      dropdownCont.classList.add("dropdown-container");

      divSwitches.classList.add("form-switch");
      divSwitches.innerText = nomCapaFix;

      var switchCapa = document.createElement("input");
      switchCapa.type = "checkbox";

      switchCapa.classList.add("form-check-input", "me-3", "layers");

      switchCapa.id = "switch" + nomCapaFix;
      switchCapa.group = nomGrupo;
      switchCapa.name = nomCapa;

      if ($("#grupo" + nomDependeciaFix).length === 0) {
        layersList.appendChild(grupo);
        grupo.appendChild(button);
        grupo.appendChild(dropdownCont);
      }

      var dropContainer = document.getElementById(
        "container" + nomDependeciaFix
      );

      // Inside the forEach loop where divSwitches is created

      // Create the button element
      const infoButton = document.createElement("button");

      // Add classes for styling (e.g., Bootstrap classes)
      infoButton.classList.add("btn", "btn-sm", "info-button");

      // Add the info icon HTML
      infoButton.innerHTML = "<i class='fa fa-info-circle'></i>";

      // Create a tooltip for the info button
      infoButton.setAttribute("title", "Obtener Información de Capa");

      // Inside the forEach loop where divSwitches is created
      infoButton.addEventListener("click", function () {
        // Check if the clicked button already has the "selected" class
        if (this.classList.contains("selected")) {
          // If it does, remove the "selected" class
          this.classList.remove("selected");
          // Reset the selectedLayerInfo variable to null or any other default value
          selectedLayerInfo = null; // Or any other default value
        } else {
          // Deselect all other info-buttons
          document.querySelectorAll(".info-button").forEach((btn) => {
            btn.classList.remove("selected");
          });
          // Select the clicked info-button
          this.classList.add("selected");
          // Save the selected layer info
          selectedLayerInfo = element;
        }
      });

      infoButton.style.display = "none";
      // Append the button to divSwitches
      divSwitches.appendChild(infoButton);

      dropContainer.appendChild(divSwitches);
      divSwitches.prepend(switchCapa);

      if (nomCapa === "colonias") {
        var ele = new L.WFS({
          url: "https://www.clustersig.com/geoserver/wfs",
          typeNS: nomSeparado[0],
          typeName: nomSeparado[1],
          geometryField: "geom",
        });
        baseLyrGroup.addLayer(ele);
      }
    });

    layersBase = baseLyrGroup.getLayers();

    var dropdownBtn = document.getElementsByClassName("dropdown-btn");

    for (var i = 0; i < dropdownBtn.length; i++) {
      dropdownBtn[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
          dropdownContent.style.display = "none";
        } else {
          dropdownContent.style.display = "block";
        }
      });
    }

    arrayCapasActivas = document.getElementsByClassName("layers");

    // Define an object to store layer IDs and their associated popups
    const layerPopups = {};

    // Function to create a popup with a table for each feature
    function createPopup(e, feature) {
      const content = createTable(feature.properties);
      const popup = L.popup({ maxWidth: 800 })
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(map2);
      return popup;
    }

    selectedPolygons = L.layerGroup().addTo(map2);

    map2.on("click", function (e) {
      selectedPolygons.clearLayers();
      wmsLayers.eachLayer((layer) => {
        if (layer.options.layers === selectedLayerInfo) {
          layer.getFeatureInfo({
            latlng: e.latlng,
            done: function (featureCollection) {
              // Create the newly selected polygon layer using WFS
              if (featureCollection.features.length > 0) {
                featureCollection.features.forEach((feature) => {
                  let featureInfo = L.Geoserver.wfs(
                    "https://www.clustersig.com/geoserver/wfs",
                    {
                      layers: `${layer.options.layers}`,
                      CQL_FILTER: `IN('${feature.id}')`,
                      style: {
                        weight: 3,
                        color: "red",
                        fill: false,
                      },
                      fitLayer: false,
                    }
                  );

                  featureInfo.addTo(selectedPolygons);

                  // Create a popup with a table for each feature
                  const popup = createPopup(e, feature);
                  const layerId = L.stamp(featureInfo);

                  // Store the popup associated with the layer
                  layerPopups[layerId] = popup;
                });
              }
            },
            fail: function (errorThrown) {
              console.log("getFeatureInfo failed: ", errorThrown);
            },
          });
        }
      });
    });

    Array.from(arrayCapasActivas).forEach(function (element) {
      element.addEventListener("click", (event) => {
        const capa = element.group + ":" + element.name;
        if (event.target.checked === true) {
          wmsLayer = L.tileLayer.wms(
            "https://www.clustersig.com/geoserver/wms",
            {
              layers: capa,
              format: "image/png",
              transparent: true,
            }
          );
          wmsLayers.addLayer(wmsLayer);
          // Show the sibling info button
          event.target.nextElementSibling.style.display = "inline-flex";
        } else {
          wmsLayers.eachLayer(function (layer) {
            if (layer.options.layers === capa) {
              wmsLayers.removeLayer(layer);
            }
          });
          event.target.nextElementSibling.style.display = "none";

          // Remove corresponding layers from selectedPolygons
          selectedPolygons.eachLayer(function (layer) {
            if (layer.options.layers === capa) {
              selectedPolygons.removeLayer(layer);
              // Remove corresponding popup
              const layerId = L.stamp(layer);
              const popup = layerPopups[layerId];
              if (popup) {
                popup.remove();
                delete layerPopups[layerId];
              }
            }
          });
        }
      });
    });
  })
  .then(() => {
    // CONTROL DE BARRA DE BUSQUEDA
    var lr = baseLyrGroup.getLayers();
    ctrlSearch = L.control
      .search({
        layer: lr[0],
        propertyName: "nomb_fracc",
        initial: false,
        position: "topright",
        textPlaceholder: "Buscar por...",
        textErr: "Busqueda no encontrada",
        textCancel: "Cancelar",
        marker: false,
        moveToLocation: function (latlng, title, map) {
          map2.fitBounds(latlng.layer.getBounds());
        },
      })
      .addTo(map2);

    ctrlSearch.on("search:locationfound", function (e) {
      coloniasLayers.clearLayers();
      e.layer.setStyle({ fillColor: "none", color: "#FF0000", weight: 3 });
      e.layer.addTo(coloniasLayers);
    });
  });

// Function to create a table from feature properties
function createTable(properties) {
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  for (const prop in properties) {
    const row = document.createElement("tr");
    const cell1 = document.createElement("td");
    const cell2 = document.createElement("td");
    cell1.textContent = prop;
    cell2.textContent = properties[prop];
    row.appendChild(cell1);
    row.appendChild(cell2);
    table.appendChild(row);
  }

  return table;
}
