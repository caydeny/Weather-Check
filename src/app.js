// State
let currCity = "";
let units = "metric";

// Selectors
const city = document.querySelector(".weather__city");
const datetime = document.querySelector(".weather__datetime");
const weather__forecast = document.querySelector(".weather__forecast p");
const weather__temperature = document.querySelector(".weather__temperature");
const weather__icon = document.querySelector(".weather__icon img");
const weather__minmax = document.querySelector(".weather__minmax");
const weather__realfeel = document.querySelector(".weather__realfeel");
const weather__humidity = document.querySelector(".weather__humidity");
const weather__wind = document.querySelector(".weather__wind");
const weather__pressure = document.querySelector(".weather__pressure");
const weather__sunrise = document.querySelector(".weather__sunrise");
const weather__sunset = document.querySelector(".weather__sunset");
const loadingEl = document.querySelector(".weather__loading");
const errorEl = document.querySelector(".weather__error");
const lastUpdated = document.querySelector(".weather__last-updated span");
const celsiusBtn = document.querySelector(".weather_unit_celsius");
const fahrenheitBtn = document.querySelector(".weather_unit_farenheit");
const locationBtn = document.querySelector(".weather__location-btn");

// Utility function to handle state changes
function updateWeatherState(cityName) {
    if (cityName) {
        currCity = cityName;
        showLoading();
        getWeatherData();
    }
}

// Search
document.querySelector(".weather__search").addEventListener("submit", e => {
    const search = document.querySelector(".weather__searchform");
    e.preventDefault();
    const searchTerm = search.value.trim();
    updateWeatherState(searchTerm);
    search.value = "";
});

// Units
celsiusBtn.addEventListener("click", () => {
    if (units !== "metric") {
        units = "metric";
        celsiusBtn.classList.add("active");
        fahrenheitBtn.classList.remove("active");
        if (currCity) {
            showLoading();
            getWeatherData();
        }
    }
});

fahrenheitBtn.addEventListener("click", () => {
    if (units !== "imperial") {
        units = "imperial";
        fahrenheitBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
        if (currCity) {
            showLoading();
            getWeatherData();
        }
    }
});

// Geolocation
locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                hideLoading();
                showError("Location access denied. Please search for a city manually.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

// Loading state functions
function showLoading() {
    loadingEl.style.display = "flex";
    document.querySelector(".app-grid").style.display = "none";
    errorEl.style.display = "none";
}

function hideLoading() {
    loadingEl.style.display = "none";
    document.querySelector(".app-grid").style.display = "grid";
}


function showError(message) {
    errorEl.querySelector("p").textContent = message;
    errorEl.style.display = "flex";
    document.querySelector(".app-grid").style.display = "none";  // Hide the main weather grid
    loadingEl.style.display = "none";  // Hide the loading spinner
    currCity = ""; // Clear the current city so we reset the state properly
}

function setupErrorHandling() {
    const retryButton = errorEl.querySelector('button');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            // Hide error overlay
            errorEl.style.display = 'none';
            // Show main grid
            document.querySelector(".app-grid").style.display = 'grid';
            // Reset search form
            const searchForm = document.querySelector(".weather__searchform");
            searchForm.value = '';
            searchForm.focus();
            // Reset loading state
            loadingEl.style.display = "none";
        });
    }
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    setupErrorHandling();
    
    // If geolocation is available try to get location on load
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            }, 
            () => {
                hideLoading();
            }
        );
    }
});

// Convert timestamp with timezone
function convertTimeStamp(timestamp, timezone, includeDate = true) {
    // Create a date object from the timestamp
    const date = new Date(timestamp * 1000);
    
    // Calculate the UTC time by adding the timezone offset (in seconds)
    // This handles the timezone conversion more efficiently
    const localTime = new Date(date.getTime() + (timezone * 1000));
    
    // Format options for date/time display
    const options = {
        hour: "numeric",
        minute: "numeric",
        hour12: true
    };
    
    if (includeDate) {
        options.weekday = "long";
        options.day = "numeric";
        options.month = "long";
        options.year = "numeric";
    }
    
    return new Intl.DateTimeFormat("en-US", options).format(localTime);
}

// Convert country code to name
function convertCountryCode(country) {
    const regionNames = new Intl.DisplayNames(["en"], {type: "region"});
    return regionNames.of(country);
}

// Get weather by coordinates
function getWeatherByCoords(lat, lon) {
    fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("Weather data not available");
            }
            return res.json();
        })
        .then(data => {
            currCity = data.name;
            updateWeatherUI(data);
            hideLoading();
        })
        .catch(() => {
            showError("Weather data not available. Please try again.");
        });
}

// Get weather data from API
function getWeatherData() {
    if (!currCity) {
        hideLoading();
        return;
    }

    fetch(`${WEATHER_API_URL}?q=${currCity}&appid=${API_KEY}&units=${units}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("City not found");
            }
            return res.json();
        })
        .then(data => {
            updateWeatherUI(data);
            hideLoading();
        })
        .catch(() => {
            showError("City not found. Please try again.");
        });
}

// Update weather UI
function updateWeatherUI(data) {
    city.textContent = `${data.name}, ${convertCountryCode(data.sys.country)}`;
    datetime.textContent = convertTimeStamp(data.dt, data.timezone);
    weather__forecast.textContent = data.weather[0].main;
    weather__temperature.textContent = `${Math.round(data.main.temp)}°`;
    
    const iconCode = data.weather[0].icon;
    weather__icon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weather__icon.alt = data.weather[0].description;
    
    weather__minmax.innerHTML = `<p>Min: ${Math.round(data.main.temp_min)}°</p><p>Max: ${Math.round(data.main.temp_max)}°</p>`;
    weather__realfeel.textContent = `${Math.round(data.main.feels_like)}°`;
    weather__humidity.textContent = `${data.main.humidity}%`;
    weather__wind.textContent = `${Math.round(data.wind.speed)} ${units === "imperial" ? "mph": "m/s"}`;
    weather__pressure.textContent = `${data.main.pressure} hPa`;
    weather__sunrise.textContent = convertTimeStamp(data.sys.sunrise, data.timezone, false);
    weather__sunset.textContent = convertTimeStamp(data.sys.sunset, data.timezone, false);
    
    // Update last updated time
    lastUpdated.textContent = new Date().toLocaleTimeString();
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    // If geolocation is available try to get location on load
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            }, 
            () => {
                hideLoading();
            }
        );
    }
});