// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-11-01&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes magnitude, location, and time of recording for each earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Magnitude ${feature.properties.mag} earthquake</h3><p>Depth of: ${feature.geometry.coordinates[2]} <br> Located at: ${feature.properties.place}<br>Recorded on: ${new Date(feature.properties.time)}</p>`);
  }

 // Simple function that will allow the size of each circle to be linked to magnitude.
  function radius(mag) {
    return mag * 10000;
  }

  function color(depth) {
    if (depth >= 90) {
      return "#FF0000"
    }
    else if (depth >= 70) {
      return "#FF4500"
    }
    else if (depth >= 50) {
      return "#FFA500"
    }
    else if (depth >= 30) {
      return "#FFD700"
    }
    else if (depth >= 10) {
      return "#FFFF00"
    }
    else {
      return "#7CFC00"
    }
  }


  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
        return L.circle(latlng, {
          radius: radius(earthquakeData.properties.mag),
          color: color(earthquakeData.geometry.coordinates[2]),
          fillOpacity: 0.75
        });
      },
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function() {
      var div = L.DomUtil.create('div', 'info legend');
      var depths = [-10, 10, 30, 50, 30, 50, 70, 90];
      var colors = ['#7CFC00','#FFFF00','#FFD700','#FFA500','#FF4500','#FF0000']
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
        "<i style= 'background: " + colors[i] + "'></i> " + depths[i] + (depths[i+1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
      }
      return div;
    };
  legend.addTo(myMap);
};