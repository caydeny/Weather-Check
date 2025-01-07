// State
let currCity = "";
let units = "metric";

// Selectors
let city = document.querySelector(".weather__city");
let datetime = document.querySelector(".weather__datetime");
let weather__forecast = document.querySelector(".weather__forecast");
let weather__temperature = document.querySelector(".weather__temperature");
let weather__icon = document.querySelector(".weather__icon");
let weather__minmax = document.querySelector(".weather__minmax");
let weather__realfeel = document.querySelector(".weather__realfeel");
let weather__humidity = document.querySelector(".weather__humidity");
let weather__wind = document.querySelector(".weather__wind");
let weather__pressure = document.querySelector(".weather__pressure");
let weather__sunset = document.querySelector(".weather__sunset");
let weather__sunrise = document.querySelector(".weather__sunrise");

// Search
document.querySelector(".weather__search").addEventListener("submit", e => {
    let search = document.querySelector(".weather__searchform");
    e.preventDefault();
    // Change current city
    currCity = search.value;
    // Get weather forecast
    getWeather();
    search.value = "";
})

// Units
document.querySelector(".weather_unit_celsius").addEventListener("click", () => {
    if (units !== "metric") {
        units = "metric";
        getWeather();
    }
})

document.querySelector(".weather_unit_farenheit").addEventListener("click", () => {
    if (units !== "imperial") {
        units = "imperial";
        getWeather();
    }
})

// Convert timestamp
function convertTimeStamp(timestamp, timezone, includeDate = true) {
    const convertTimezone = timezone / 3600; // Convert seconds to hours

    const date = new Date(timestamp * 1000);
    const options = {
        hour: "numeric",
        minute: "numeric",
        timeZone: `Etc/GMT${convertTimezone >= 0 ? "-" : "+"}${Math.abs(convertTimezone)}`,
        hour12: true,
    };

    if (includeDate) {
        options.weekday = "long";
        options.day = "numeric";
        options.month = "long";
        options.year = "numeric";
        return date.toLocaleDateString("en-US", options);
    } else {
        return date.toLocaleTimeString("en-US", options);
    }
}

// Convert country code to name
function convertCountryCode(country) {
    let regionNames = new Intl.DisplayNames(["en"], {type: "region"});
    return regionNames.of(country);
}

function getWeather() {
    const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5';

    if (!currCity) {
        console.log("No city selected");
        // Clear UI or show a message
        city.textContent = "";
        weather__temperature.textContent = "";
        weather__forecast.textContent = "";
        weather__icon.querySelector("img").src = "";
        weather__minmax.textContent = "";
        weather__realfeel.textContent = "";
        weather__humidity.textContent = "";
        weather__wind.textContent = "";
        weather__pressure.textContent = "";
        weather__sunset.textContent = "";
        weather__sunrise.textContent = "";
        return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currCity}&appid=${API_KEY}&units=${units}`).then
    (res => res.json()).then
    (data => {
        console.log(data);
        city.innerHTML = `${data.name}, ${convertCountryCode(data.sys.country)}`;
        datetime.innerHTML = convertTimeStamp(data.dt, data.timezone);
        weather__forecast.innerHTML = `<p>${data.weather[0].main}</p>`;
        weather__temperature.innerHTML = `<p>${data.main.temp.toFixed()}&#176</p>`;
        weather__icon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png"/>`;
        weather__minmax.innerHTML = `<p>Min: ${data.main.temp_min.toFixed()}&#176</p><p>Max: ${data.main.temp_max.toFixed()}&#176</p>`;
        weather__realfeel.innerHTML = `${data.main.feels_like.toFixed()}&#176`;
        weather__humidity.innerHTML = `${data.main.humidity}%`;
        weather__wind.innerHTML = `${data.wind.speed} ${units === "imperial" ? "mph": "m/s"}`;
        weather__pressure.innerHTML = `${data.main.pressure} hPa`;
        weather__sunset.innerHTML = convertTimeStamp(data.sys.sunset, data.timezone, false);
        weather__sunrise.innerHTML = convertTimeStamp(data.sys.sunrise, data.timezone, false);
    });
}

document.body.addEventListener('load', getWeather());