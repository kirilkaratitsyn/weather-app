// Weather App

const WeatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const APIkey = "1f74a7156d618a180490a4059b6092f0";
const storageHistoryKey = "weatherHistory";
const storageLocationKey = "weatherLastLocation";

document.addEventListener("DOMContentLoaded", function () {
  loadHistory();
  getLocation();
});
WeatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value;

  if (city) {
    try {
      const weatherData = await getWeatherData(city);
      displayWeatherInfo(weatherData);
      saveToHistory(city);
    } catch (error) {
      console.log(error);
      displayError(error);
    }
  } else {
    displayError("Please Enter a city");
  }
});

async function getWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`;
  const responce = await fetch(apiUrl);
  if (!responce.ok) {
    throw new Error("Could not feth weather data");
  }

  return await responce.json();
}

function displayWeatherInfo(data) {
  const {
    name: city,
    main: { temp, humidity },
    weather: [{ description, id }],
  } = data;
  const tempC = (temp - 273.15).toFixed(0);
  const emoji = getWeatherEmoji(id);
  card.textContent = "";
  card.style.display = "flex";
  card.innerHTML = `
    <h1 class="cityDisplay">${city}</h1>
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

function displayError(message) {
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");

  card.textContent = "";
  card.style.display = "flex";
  card.appendChild(errorDisplay);
}

function getHistoryItems() {
  const historyItems = localStorage.getItem(storageHistoryKey);

  if (historyItems) {
    return JSON.parse(historyItems);
  } else {
    return [];
  }
}

function saveToHistory(city) {
  const historyItems = getHistoryItems();
  if (!historyItems.includes(city)) {
    historyItems.push(city);
    localStorage.setItem(storageHistoryKey, JSON.stringify(historyItems));
    loadHistory();
  }
}

function displayHistoryItems(historyItems) {
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
        <button class="searchCity" onclick="setQuerrySearch('${city}')">Search</button>
        <button class="deleteCity" onclick="deleteSearchItem('${city}')">Delete</button>
      </div>
    </li>
  `;
    });
  } else {
    historyEmpty.style.display = "block";
  }
}
function setQuerrySearch(city) {
  cityInput.value = city;
  WeatherForm.requestSubmit();
}
function deleteSearchItem(city) {
  const historyItems = getHistoryItems();
  if (historyItems.includes(city)) {
    const updatedHistoryItems = historyItems.filter((item) => item !== city);
    localStorage.setItem(
      storageHistoryKey,
      JSON.stringify(updatedHistoryItems),
    );
    displayHistoryItems(updatedHistoryItems);
  }
}
function loadHistory() {
  displayHistoryItems(getHistoryItems());
}

async function getLocation() {
  const lastLocation = getLastLocation();

  if (lastLocation) {
    setQuerrySearch(lastLocation);
    return;
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const city = data.city;

    if (city) {
      setLastLocation(city);
      setQuerrySearch(city);
    }
  } catch (error) {
    console.log("Location error:", error);
  }
}

function getLastLocation() {
  const lastLocation = localStorage.getItem(storageLocationKey);

  if (lastLocation) {
    return lastLocation;
  } else {
    return "";
  }
}

function setLastLocation(city) {
  localStorage.setItem(storageLocationKey, city);
}
