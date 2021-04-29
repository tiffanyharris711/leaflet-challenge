// Store our API endpoint inside queryUrl
// var queryUrl =
//   "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>" +
        feature.properties.place +
        "</h3><hr><p>" +
        new Date(feature.properties.time) +
        "</p><h4><hr><p>" +
        "Magnitude: " + (feature.properties.mag) +
        " |          Depth: " + (feature.geometry.coordinates[2]) +
        "</p></h4>"
        );
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 6;
  }

  function getColor(depth) {
    switch (true) {
      case depth > 40:
        return "#EA202C";
      case depth > 30:
        return "#FD4D0C";
      case depth > 20:
        return "#FB9902";
      case depth > 10:
        return "#FDDC22";
      case depth > 1:
        return "#E4F132";
      default:
        return "#afff14";
    }
  }

  function circleStyle(feature) {
    return {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#808080",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: circleStyle,
    onEachFeature: onEachFeature,
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  var lightmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY,
    }
  );

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [lightmap, earthquakes],
  });

  //-----------------LEGEND---------------//

  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [1, 10, 20, 30, 40];
    var colors = [
      "#afff14",
      "#E4F132",
      "#FDDC22",
      "#FB9902",
      "#FD4D0C",
      "#EA202C"
    ];

    // loop through our magnitude and generate a label with a colored square for each interval
    var legendInfo = "<h3>Depth of Earthquakes</h3>"
    div.innerHTML = legendInfo;

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        "<i style='background: " +
        colors[i] +
        "'></i> " +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<p>" : "+");
    }

    return div;
  };


  legend.addTo(myMap);

}
