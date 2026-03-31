// Weather App

const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const APIkey = "1f74a7156d618a180490a4059b6092f0";
const storageHistoryKey = "weatherHistory";
const storageLocationKey = "weatherLastLocation";
const panelSuggestions = document.querySelector(".searchSuggestions");
let listSuggestions = document.querySelector(".suggestionsList");
const suggestionsEmptyState = document.querySelector(".suggestionsStatusEmpty");
let currentDisplayedLocation = { city: "", country: "" };
let searchTimer;
let suggestionsItems = [];

document.addEventListener("DOMContentLoaded", function () {
  renderSearchHistory();
  loadInitialLocationWeather();
  cityInput.addEventListener("blur", () => {
    setTimeout(() => {
      panelSuggestions.setAttribute("hidden", "");
    }, 300);
   
  });
  cityInput.addEventListener("focus", () => {
    getSearchQuery(cityInput);
  });

  cityInput.addEventListener("input", () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      getSearchQuery(cityInput);
    }, 300);
  });
});

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (city) {
    if (normalizeCity(city) === normalizeCity(currentDisplayedLocation.city)) {
      return;
    }

    try {
      const weatherData = await fetchWeatherData(city);
      renderWeatherCard(weatherData);
      saveCityToHistory(weatherData);
    } catch (error) {
      console.log(error);
      renderErrorCard(error);
    }
  } else {
    renderErrorCard("Please Enter a city");
  }
});

async function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`;
  const responce = await fetch(apiUrl);
  if (!responce.ok) {
    throw new Error("Could not feth weather data");
  }

  return await responce.json();
}

function renderWeatherCard(data) {
  const {
    name: city,
    sys: { country },
    main: { temp, humidity },
    weather: [{ description, id }],
  } = data;
  const tempC = (temp - 273.15).toFixed(0);
  const emoji = getWeatherEmoji(id);
  currentDisplayedLocation = { city, country };
  card.textContent = "";
  card.style.display = "flex";
  card.innerHTML = `
    <h1 class="cityDisplay">${currentDisplayedLocation.city}</h1>
    <p class="countryDisplay">${currentDisplayedLocation.country}</p>
    <p class="tempDisplay">${tempC}°C</p>
    <p class="humidityDisplay">Humidity: ${humidity}%</p>
    <p class="descriptionDisplay">${description}</p>
    <p class="weatherEmoji">${emoji}</p>
  `;
}

function getWeatherEmoji(weatherId) {
  switch (true) {
    case weatherId >= 200 && weatherId < 300:
      return "⛈️";
    case weatherId >= 301 && weatherId < 400:
      return "⛈️";
    case weatherId >= 401 && weatherId < 500:
      return "⛈️";
    case weatherId >= 501 && weatherId < 600:
      return "❄️";
    case weatherId >= 601 && weatherId < 700:
      return "💨";
    case weatherId === 800:
      return "☀️";
    case weatherId >= 801 && weatherId < 810:
      return "☁️";
    default:
      return "?";
  }
}

function renderErrorCard(message) {
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");

  card.textContent = "";
  card.style.display = "flex";
  card.appendChild(errorDisplay);
}

function getSavedHistoryCities() {
  const historyItems = localStorage.getItem(storageHistoryKey);

  if (historyItems) {
    return normalizeHistoryEntries(JSON.parse(historyItems));
  } else {
    return [];
  }
}

function saveCityToHistory(weatherData) {
  const historyItems = getSavedHistoryCities();
  const historyEntry = createHistoryEntry(weatherData);
  const isDuplicateEntry = historyItems.some((item) => {
    return (
      normalizeCity(item.searchQuery) ===
      normalizeCity(historyEntry.searchQuery)
    );
  });

  if (!isDuplicateEntry) {
    historyItems.push(historyEntry);
    localStorage.setItem(storageHistoryKey, JSON.stringify(historyItems));
    renderSearchHistory();
  }
}

function renderHistoryList(historyItems) {
  const historyList = document.querySelector(".historyList");
  const historyEmpty = document.querySelector(".historyEmpty");
  historyList.textContent = "";
  if (historyItems.length !== 0) {
    historyEmpty.style.display = "none";
    historyItems.forEach((historyItem) => {
      historyList.innerHTML += `
    <li class="historyItem">
      <span class="historyEmoji" aria-hidden="true">🕘</span>
      <div class="historyMain">
        <div class="historyLocation">
          <span class="historyCity">${historyItem.city}</span>
          <span class="historyCountry">${historyItem.country}</span>
        </div>
        <button class="searchCity" onclick='submitCitySearch(${JSON.stringify(historyItem.searchQuery)})'>Search</button>
        <button class="deleteCity" onclick='removeCityFromHistory(${JSON.stringify(historyItem.searchQuery)})'>Delete</button>
      </div>
    </li>
  `;
    });
  } else {
    historyEmpty.style.display = "block";
  }
}
function submitCitySearch(city) {
  console.log(city)
  cityInput.value = city;
  console.log(cityInput.value)
  weatherForm.requestSubmit();
}
function removeCityFromHistory(city) {
  const historyItems = getSavedHistoryCities();
  const updatedHistoryItems = historyItems.filter((item) => {
    return normalizeCity(item.searchQuery) !== normalizeCity(city);
  });

  if (updatedHistoryItems.length !== historyItems.length) {
    localStorage.setItem(
      storageHistoryKey,
      JSON.stringify(updatedHistoryItems),
    );
    renderHistoryList(updatedHistoryItems);
  }
}
function renderSearchHistory() {
  renderHistoryList(getSavedHistoryCities());
}
function normalizeCity(city) {
  return city.trim().toLowerCase();
}
async function loadInitialLocationWeather() {
  const lastLocation = getSavedLastLocation();

  if (lastLocation) {
    submitCitySearch(lastLocation);
    return;
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const city = data.city;

    if (city) {
      saveLastLocation(city);
      submitCitySearch(city);
    }
  } catch (error) {
    console.log("Location error:", error);
  }
}

function getSavedLastLocation() {
  const lastLocation = localStorage.getItem(storageLocationKey);

  if (lastLocation) {
    return lastLocation;
  } else {
    return "";
  }
}

function saveLastLocation(city) {
  localStorage.setItem(storageLocationKey, city);
}
function createHistoryEntry(weatherData) {
  const {
    name: city,
    sys: { country },
  } = weatherData;

  return {
    city,
    country,
    searchQuery: formatLocationLabel({ city, country }),
  };
}

function normalizeHistoryEntries(historyItems) {
  if (!Array.isArray(historyItems)) {
    return [];
  }

  return historyItems
    .map((historyItem) => {
      if (typeof historyItem === "string") {
        return {
          city: historyItem,
          country: "",
          searchQuery: historyItem,
        };
      }

      if (!historyItem || typeof historyItem !== "object") {
        return null;
      }

      const city = typeof historyItem.city === "string" ? historyItem.city : "";
      const country =
        typeof historyItem.country === "string" ? historyItem.country : "";

      if (!city) {
        return null;
      }

      return {
        city,
        country,
        searchQuery:
          typeof historyItem.searchQuery === "string" && historyItem.searchQuery
            ? historyItem.searchQuery
            : formatLocationLabel({ city, country }),
      };
    })
    .filter(Boolean);
}

function formatLocationLabel(location) {
  if (!location.country) {
    return location.city;
  }

  return `${location.city}, ${location.country}`;
}

async function getSearchQuery(cityInput) {
  const inputValue = cityInput.value.trim();
  if (inputValue.length > 3 && document.activeElement === cityInput) {
    panelSuggestions.removeAttribute("hidden");
    await getSuggestions(inputValue);
    updateSuggestions();
  } else {
    panelSuggestions.setAttribute("hidden", "");
  }
}

async function getSuggestions(inputValue) {
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${inputValue}&limit=5&appid=${APIkey}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Could not fetch city suggestions");
  }

  suggestionsItems = await response.json();

  return suggestionsItems;
}

function updateSuggestions() {
  listSuggestions.innerHTML = "";

  if (suggestionsItems.length === 0) {
    suggestionsEmptyState.removeAttribute("hidden");
    return;
  }

  suggestionsEmptyState.setAttribute("hidden", "");

  suggestionsItems.forEach((suggestionsItem) => {
    const formattedLocation = suggestionsItem.state
      ? `${suggestionsItem.name}, ${suggestionsItem.state}, ${suggestionsItem.country}`
      : `${suggestionsItem.name}, ${suggestionsItem.country}`;
    console.log(formattedLocation)
    listSuggestions.innerHTML += `
      <button
        type="button"
        class="suggestionItem"
        onclick='submitCitySearch(${JSON.stringify(formattedLocation)})'
      >
        <span class="suggestionCopy">
          <span class="suggestionCity">${suggestionsItem.name}</span>
          <span class="suggestionMeta"> ${suggestionsItem.state}, ${suggestionsItem.country}</span>
        </span>
      </button>
    `;
  });
}
