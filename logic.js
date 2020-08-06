// store the given API endpoint inside queryUrl // 
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Get request for data
d3.json(earthquakeURL, function(data) {
    createFeatures(data.features);
});
// define each function to run the "onEach" feature //
function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
          },

          pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: getRadius(feature.properties.mag),
              fillColor: getColor(feature.properties.mag),
              fillOpacity: .5,
              color: "black",
              stroke: true,
              weight: .8
          })
        }
        });

    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define the map layers
    var airmap = L.tileLayer("https://api.mapbox.com/styles/v1/mfatih72/ck30s2f5b19ws1cpmmw6zfumm/tiles/256/{z}/{x}/{y}?" + 
    "access_token=pk.eyJ1IjoibWZhdGloNzIiLCJhIjoiY2sycnMyaDVzMGJxbzNtbng0anYybnF0MSJ9.aIN8AYdT8vHnsKloyC-DDA");
  
       
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mfatih72/ck30r72r818te1cruud5wk075/tiles/256/{z}/{x}/{y}?" + 
    "access_token=pk.eyJ1IjoibWZhdGloNzIiLCJhIjoiY2sycnMyaDVzMGJxbzNtbng0anYybnF0MSJ9.aIN8AYdT8vHnsKloyC-DDA");

        
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mfatih72/ck30rkku519fu1drmiimycohl/tiles/256/{z}/{x}/{y}?" + 
    "access_token=pk.eyJ1IjoibWZhdGloNzIiLCJhIjoiY2sycnMyaDVzMGJxbzNtbng0anYybnF0MSJ9.aIN8AYdT8vHnsKloyC-DDA");
    
      // Define base maps
    var baseMaps = {
        "LightMap": lightMap,
        "AirMap": airmap,
        "Satellite": satellite
    };

    // create the tectonic layer
    var tectonicPlates = new L.LayerGroup();

    // create the overlay object to hold the overlay layer //
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // create the map //
    var myMap = L.map("map", {
        center: [40.7, -94.5],
        zoom: 5,
        layers: [lightMap, earthquakes, tectonicPlates]
    });

    // add the tectonic plates data from json //
    d3.json(tectonicPlatesURL, function(tectonicData) {
        L.geoJson(tectonicData, {
            color: "blue",
            weight: 2
        })
        .addTo(tectonicPlates);
    });

    // add the layer control to the map // 
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // create the legend // 
    var legend = L.control({
        position: "bottomleft"
    });

    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // create the legend //
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };
    legend.addTo(myMap);
}

// create the color function //
// alot of else if statements for conditionals on magnitutde //
function getColor(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'yellow'
    } else if (magnitude > 2) {
        return 'lightgreen'
    } else if (magnitude > 1) {
        return 'green'
    } else {
        return 'magenta'
    }
};

// create the radius function //
function getRadius(magnitude) {
    return magnitude * 20000;
};