let restaurants, neighborhoods, cuisines;
var map;
var markers = [];
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  fetchNeighborhoods();
  fetchCuisines();
  /* Added for working offline */
  updateRestaurants();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById("neighborhoods-select");
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement("option");
    if (localStorage.getItem("neighborhood") === neighborhood) {
      option.setAttribute("selected", "selected");
    }
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById("cuisines-select");
  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    /* Set the options user selected before navigating away from index.html, once he returns to it by hitting 'back' */
    if (localStorage.getItem("cuisine") === cuisine) {
      option.setAttribute("selected", "selected");
      localStorage.clear();
    }
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById("cuisines-select");
  const nSelect = document.getElementById("neighborhoods-select");

  let cIndex = cSelect.selectedIndex;
  let nIndex = nSelect.selectedIndex;

  let cuisine, neighborhood;
  /* Offline handling of remembering a user's selectons if they navigate away and then back to main page */
  const localStorageAvailable = storageAvailable("localStorage");
  if (localStorageAvailable) {
    if (cIndex >= 0) {
      localStorage.setItem("cuisIndex", cIndex);
      localStorage.setItem("cuisine", cSelect[cIndex].value);
    } else {
      cIndex = localStorage.getItem("cuisIndex");
      cuisine = localStorage.getItem("cuisine");
      console.log(cSelect);
    }

    if (nIndex >= 0) {
      localStorage.setItem("neighbIndex", nIndex);
      localStorage.setItem("neighborhood", nSelect[nIndex].value);
    } else {
      nIndex = localStorage.getItem("neighbIndex");
      neighborhood = localStorage.getItem("neighborhood");
      nSelect.value = neighborhood;
    }
  }
  /* If any data in localStorage, means user navigated back to main page from restaurant.html; else just use his current selection */
  if (!cuisine) {
    cuisine = cSelect[cIndex].value;
  }
  if (!neighborhood) {
    neighborhood = nSelect[nIndex].value;
  }

  /* TODO: FIX SELECT VALUE DISPLAY;  */

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    }
  );
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById("restaurants-list");
  ul.innerHTML = "";

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML (including no-results element) and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById("restaurants-list");
  ul.setAttribute("tabindex", "0");
  ul.setAttribute("aria-label", "restaurants list");
  if (restaurants.length === 0) {
    let noResults = document.createElement("h1");
    noResults.innerHTML = "Sorry, there are no results matching your criteria.";
    noResults.setAttribute("tabindex", "0");
    ul.appendChild(noResults);
    return;
  }
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement("li");
  li.setAttribute("aria-label", "restaurant details");
  const image = document.createElement("img");
  image.setAttribute("alt", `${restaurant.name}'s restaurant photo`);
  image.className = "restaurant-img";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement("h3");
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement("p");
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement("p");
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement("a");
  more.setAttribute(
    "aria-label",
    restaurant.name + ", " + restaurant.neighborhood
  );
  more.innerHTML = "View Details";
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, "click", () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

function storageAvailable(type) {
  try {
    var storage = window[type],
      x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
    );
  }
}
