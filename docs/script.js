// Initialize the map and set its view to Bogota's coordinates
var map = L.map('map').setView([4.7110, -74.0721], 13);
var geoJsonLayer; // variable to hold the geojson layer

// Add a tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var geojsonInput = document.getElementById('geojson-input');
var addGeojsonBtn = document.getElementById('add-geojson');
var validationMessage = document.getElementById('validation-message');

function addGeoJsonToMap(geojsonData) {
    try {
        // If there's an existing layer, remove it
        if (geoJsonLayer) {
            map.removeLayer(geoJsonLayer);
        }

        // Add new GeoJSON layer
        geoJsonLayer = L.geoJSON(geojsonData, {
            onEachFeature: function (feature, layer) {
                // You can add popups or other interactions here
                if (feature.properties) {
                    layer.bindPopup(Object.keys(feature.properties).map(function(k){
                        return k + ": " + feature.properties[k];
                    }).join("<br />"));
                }
            }
        }).addTo(map);

        if (Object.keys(geoJsonLayer.getBounds()).length === 0) {
            throw new Error('GeoJSON válido, pero no contiene coordenadas para mostrar.');
        }

        // Fit map to the new layer's bounds
        map.fitBounds(geoJsonLayer.getBounds());
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

addGeojsonBtn.addEventListener('click', function() {
    var geojsonStr = geojsonInput.value;
    validationMessage.textContent = '';
    validationMessage.style.color = 'red';

    if (geojsonStr.trim() === '') {
        validationMessage.textContent = 'El campo no puede estar vacío.';
        return;
    }

    try {
        var geojsonData = JSON.parse(geojsonStr);
        var result = addGeoJsonToMap(geojsonData);

        if (result.success) {
            validationMessage.textContent = 'GeoJSON agregado correctamente.';
            validationMessage.style.color = 'green';
        } else {
            validationMessage.textContent = 'Error: GeoJSON inválido. ' + result.message;
        }

    } catch (e) {
        validationMessage.textContent = 'Error: GeoJSON inválido. ' + e.message;
    }
});

function loadInitialData() {
    fetch('map.geojson')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            addGeoJsonToMap(data);
        })
        .catch(function(error) {
            console.error('Error al cargar el archivo GeoJSON inicial:', error);
            validationMessage.textContent = 'No se pudo cargar el GeoJSON inicial.';
            validationMessage.style.color = 'red';
        });
}

// Load the initial GeoJSON data when the script runs
loadInitialData();
