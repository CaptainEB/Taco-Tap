function initMap() {
	// Create the map.
	const LA = new google.maps.LatLng(34.0522, -118.2437);
	const map = new google.maps.Map(document.getElementById("map"), {
		center: LA,
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
	service.nearbySearch({ location: LA, radius: 2500, keyword: "taco trucks" }, (results, status, pagination) => {
		if (status !== "OK" || !results) return;

		addPlaces(results, map);
		moreButton.disabled = !pagination || !pagination.hasNextPage;
		if (pagination && pagination.hasNextPage) {
			getNextPage = () => {
				// Note: nextPage will call the same handler function as the initial call
				pagination.nextPage();
			};
		}
	});
}

function addPlaces(places, map) {
	const placesList = document.getElementById("places");

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

window.initMap = initMap;
google.maps.event.addDomListener(window, "load", initMap);
