const openWeatherAPIKey = "c674ad2b8edde2ba9d195589ab42402d";
const GeoURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
const openWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=";

// Global variables
var userInput = $("#location");
let cityLat;
let cityLon;

async function GetCoordinates(city) {
	const response = await fetch(GeoURL + userInput.val() + "&appid=" + openWeatherAPIKey);
	if (response.ok) {
		const coordinates = await response.json();
		// console.log(coordinates);
		return coordinates;
	}
}

$("#search-button").click(async () => {
	const coordinates = await GetCoordinates(userInput.val());
	cityLat = coordinates[0].lat;
	cityLon = coordinates[0].lon;
	initMap(cityLat, cityLon);
});

// This function adds the map and the places found on page load
function initMap(lat, lon) {
	// Create the map.
	if (!lat && !lon) {
		lat = 34.0522;
		lon = -118.2437;
		var city = new google.maps.LatLng(lat, lon);
	} else {
		lat = cityLat;
		lon = cityLon;
		var city = new google.maps.LatLng(cityLat, cityLon);
	}
	const map = new google.maps.Map(document.getElementById("map"), {
		center: city,
		zoom: 15,
		mapId: "8d193001f940fde3",
	});
	// Create the places service.
	const service = new google.maps.places.PlacesService(map);
	let getNextPage;
	const moreButton = document.getElementById("more");
	moreButton.onclick = function () {
		moreButton.disabled = true;
		if (getNextPage) {
			getNextPage();
		}
	};

	// Perform a nearby search for taco trucks.
	service.nearbySearch({ location: city, radius: 2500, keyword: "taco trucks" }, (results, status, pagination) => {
		if (status !== "OK" || !results) return;
		addPlaces(results, map);
		moreButton.disabled = !pagination || !pagination.hasNextPage;
		if (pagination && pagination.hasNextPage) {
			getNextPage = () => {
				// NextPage will call the same handler function as the initial call
				pagination.nextPage();
			};
		}
	});

	getWeather(lat, lon);
}

// This function will get the weather data
async function getWeather(lat, lon) {
	const response = await fetch(openWeatherURL + lat + "&lon=" + lon + "&appid=" + openWeatherAPIKey);
	if (response.ok){ 
		const weather = await response.json();
		console.log(weather);
		return weather;
	}
	else {
		return 'ERROR: could not get weather data';
	}
}

// This function adds the places to a list
function addPlaces(places, map) {
	const placesList = document.getElementById("places");
	$("#places").empty();

	for (const place of places) {
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

			const li = document.createElement("li");
			li.textContent = place.name;
			placesList.appendChild(li);
			li.addEventListener("click", () => {
				map.setCenter(place.geometry.location);
			});
		}
	}
}

// Call the initMap function when the Google Maps JavaScript API is loaded
function loadMapScript() {
	const script = document.createElement("script");
	script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAYdrM8Jb0q36HFMBSDry2n6f-tuTTWTuo&callback=initMap&libraries=places`;
	script.defer = true;
	script.async = true;
	document.head.appendChild(script);
}

// Call the loadMapScript function to load the API and define the initMap function
loadMapScript();
