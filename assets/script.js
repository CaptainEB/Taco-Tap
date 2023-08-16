// API links
const openWeatherAPIKey = "c674ad2b8edde2ba9d195589ab42402d";
const GeoURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
const openWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=";

// Global variables
let userInput = $("#location");
let checkBox = $("#checkBox");
let theme;
let cityLat;
let cityLon;
let map;

// Theme selection
themeSelector();

// Get city coordinates using OpenWeather API's geolocation service
async function getCoordinates(city) {
    const response = await fetch(GeoURL + userInput.val() + "&appid=" + openWeatherAPIKey);
    if (response.ok) {
        const coordinates = await response.json();
        return coordinates;
    }
}

// Search button click event
$("#search-button").click(async () => {
    const coordinates = await getCoordinates(userInput.val());
    cityLat = coordinates[0].lat;
    cityLon = coordinates[0].lon;
    initMap(cityLat, cityLon);
});

// "Current Location" button click event
$("#current-location-button").click(() => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            cityLat = position.coords.latitude;
            cityLon = position.coords.longitude;
            initMap(cityLat, cityLon);
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// Get weather data using OpenWeather API
async function getWeather(lat, lon) {
    const response = await fetch(openWeatherURL + lat + "&lon=" + lon + "&appid=" + openWeatherAPIKey);
    if (response.ok) {
        const weather = await response.json();
        return weather;
    } else {
        return "ERROR: could not get weather data";
    }
}

// Add taco truck places to the list and map
function addPlaces(places) {
    const placesList = document.getElementById("results-list");
    $("#results-list").empty();

    // Sort places by rating descending
    places.sort((a, b) => b.rating - a.rating);

    for (let i = 0; i < Math.min(10, places.length); i++) {
        const place = places[i];
        if (place.rating >= 4.5 && place.user_ratings_total >= 50) {
            if (place.geometry && place.geometry.location) {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span class="place-number">${i + 1}.</span>
                    <strong>${place.name}</strong><br>
                    Rating: ${place.rating.toFixed(1)} (${place.user_ratings_total} reviews)<br>
                    Address: ${place.vicinity}
                `;

                placesList.appendChild(li);

                li.addEventListener("click", () => {
                    map.setCenter(place.geometry.location);
                });
            }
        }
    }

    addMarkers(places);
}

// Add taco truck markers to the map
function addMarkers(places) {
    for (let i = 0; i < Math.min(10, places.length); i++) {
        const place = places[i];
        if (place.geometry && place.geometry.location) {
            const image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            new google.maps.Marker({
                map,
                icon: image,
                title: place.name,
                position: place.geometry.location,
            });
        }
    }
}

// Initialize the Google Map
function initMap(lat, lon) {
    if (!lat && !lon) {
        lat = 34.0522;
        lon = -118.2437;
        var city = new google.maps.LatLng(lat, lon);
    } else {
        lat = cityLat;
        lon = cityLon;
        var city = new google.maps.LatLng(cityLat, cityLon);
    }

    map = new google.maps.Map(document.getElementById("map"), {
        center: city,
        zoom: 15,
        mapId: "8d193001f940fde3",
    });

    const service = new google.maps.places.PlacesService(map);

    // Fetch nearby taco truck places with a wider initial radius
    const initialRadius = 25000; // Adjust the initial radius as needed
    fetchTacoTruckPlaces(service, city, initialRadius);
}

// Fetch taco truck places with option to increase radius if needed
function fetchTacoTruckPlaces(service, location, radius) {
    service.nearbySearch({ location: location, radius: radius, keyword: "taco trucks" }, (results, status) => {
        if (status !== "OK" || !results) return;

        // Filter and add taco truck places to the list and map
        const filteredResults = results.filter((place) => place.rating >= 4.5 && place.user_ratings_total >= 50);

        if (filteredResults.length < 10 && radius < 80000) {
            // If fewer than 10 results and radius is less than 80 km, increase radius and search again
            fetchTacoTruckPlaces(service, location, radius * 2);
        } else {
            addPlaces(filteredResults);
        }
    });
}

// Theme selection logic
function themeSelector() {
    let checkBoxStatus = localStorage.getItem("checkBoxStatus") || "notChecked";
    theme = localStorage.getItem("theme") || "light";
    if (theme == "dark") checkBox.prop("checked", true);
    else checkBox.prop("checked", false);
    $("*").css("color-scheme", theme);

    checkBox.on("change", () => {
        if (checkBox.is(":checked")) {
            localStorage.setItem("theme", "dark");
            localStorage.setItem("checkBoxStatus", "checked");
            $("*").css("color-scheme", "dark");
        } else {
            localStorage.setItem("theme", "light");
            localStorage.setItem("checkBoxStatus", "notChecked");
            $("*").css("color-scheme", "light");
        }
    });
}

// Load the Google Maps API
function loadMapScript() {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAYdrM8Jb0q36HFMBSDry2n6f-tuTTWTuo&callback=initMap&libraries=places`;
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}

// Load the Google Maps API script
loadMapScript();
