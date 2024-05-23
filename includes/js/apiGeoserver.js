function getLayerNamesFromGeoServer(geoServerUrl) {
  return new Promise((resolve, reject) => {
    // Crear una nueva solicitud XMLHttpRequest
    var xhr = new XMLHttpRequest();

    // Configurar la solicitud
    xhr.open("GET", geoServerUrl, true);

    // Configurar una función de devolución de llamada para manejar la respuesta
    xhr.onreadystatechange = function () {
      // Verificar si la solicitud está completa
      if (xhr.readyState === 4) {
        // Verificar si el estado de la respuesta es OK (código de estado 200)
        if (xhr.status === 200) {
          // La propiedad responseText contiene la respuesta XML de GeoServer
          var xmlText = xhr.responseText;

          // Ahora puedes analizar textoXml y trabajar con los datos XML
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(xmlText, "text/xml");

          // Extraer y procesar la información de la capa según sea necesario
          // Ejemplo: console.log(xmlDoc.getElementsByTagName('Layer'));

          // Suponiendo que xmlDoc es tu documento XML GetCapabilities analizado
          var layerNodes = xmlDoc.getElementsByTagName("FeatureType");
          var typeNS = [];

          // Iterar a través de los nodos de capa y extraer los nombres
          for (var i = 0; i < layerNodes.length; i++) {
            var layerNode = layerNodes[i];
            var nameNode = layerNode.firstChild;
            if (nameNode) {
              // Extraer el nombre de la capa y agregarlo al array nombresDeCapa
              var layerName = nameNode.textContent;
              typeNS.push(layerName);
            }
          }
          resolve(typeNS);
        } else {
          // Manejar el error HTTP (por ejemplo, mostrar un mensaje de error)
          console.error(
            "Failed to retrieve GeoServer capabilities. Status code: " +
              xhr.status
          );
        }
      }
    };
    // Enviar la solicitud
    xhr.send();
  });
}
