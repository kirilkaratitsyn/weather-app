// Weather App

const WeatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const APIkey = "1f74a7156d618a180490a4059b6092f0";
const storageHistoryKey = "weatherHistory";
const storageLocationKey = "weatherLastLocation";
let currentDisplayedCity = "";

document.addEventListener("DOMContentLoaded", function () {
  renderSearchHistory();
  loadInitialLocationWeather();
});
WeatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city) {
    if (normalizeCity(city) === normalizeCity(currentDisplayedCity)) {
      return;
    }

    try {
      const weatherData = await fetchWeatherData(city);
      renderWeatherCard(weatherData);
      saveCityToHistory(city);
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
    main: { temp, humidity },
    weather: [{ description, id }],
  } = data;
  const tempC = (temp - 273.15).toFixed(0);
  const emoji = getWeatherEmoji(id);
  currentDisplayedCity = city;
  card.textContent = "";
  card.style.display = "flex";
  card.innerHTML = `
    <h1 class="cityDisplay">${currentDisplayedCity}</h1>
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
    return JSON.parse(historyItems);
  } else {
    return [];
  }
}

function saveCityToHistory(city) {
  const historyItems = getSavedHistoryCities();
  if (!historyItems.includes(city)) {
    historyItems.push(city);
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
    historyItems.forEach((city) => {
      historyList.innerHTML += `
    <li class="historyItem">
      <span class="historyEmoji" aria-hidden="true">🕘</span>
      <div class="historyMain">
        <span class="historyCity">${city}</span>
        <button class="searchCity" onclick="submitCitySearch('${city}')">Search</button>
        <button class="deleteCity" onclick="removeCityFromHistory('${city}')">Delete</button>
      </div>
    </li>
  `;
    });
  } else {
    historyEmpty.style.display = "block";
  }
}
function submitCitySearch(city) {
  cityInput.value = city;
  WeatherForm.requestSubmit();
}
function removeCityFromHistory(city) {
  const historyItems = getSavedHistoryCities();
  if (historyItems.includes(city)) {
    const updatedHistoryItems = historyItems.filter((item) => item !== city);
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
