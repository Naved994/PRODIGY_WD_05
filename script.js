const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Function to get weather data by city name
async function getWeather() {
    const locationInput = document.getElementById('location-input');
    const city = locationInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    try {
        // First, get coordinates for the city
        const geoResponse = await fetch(`${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            alert('City not found. Please try another city name.');
            return;
        }

        const location = geoData.results[0];
        getWeatherByCoords(location.latitude, location.longitude, location.name, location.country);
    } catch (error) {
        alert('Error fetching weather data. Please try again.');
    }
}

// Function to get weather data by coordinates
async function getWeatherByCoords(lat, lon, cityName = '', countryCode = '') {
    try {
        const response = await fetch(
            `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`
        );
        const data = await response.json();
        
        if (data.current_weather) {
            displayWeatherData(data, cityName, countryCode);
        } else {
            alert('Error fetching weather data');
        }
    } catch (error) {
        alert('Error fetching weather data. Please try again.');
    }
}

// Function to get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                alert('Error getting location: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Function to display weather data
function displayWeatherData(data, cityName = 'Unknown City', countryCode = 'Unknown') {
    document.getElementById('city').textContent = cityName;
    document.getElementById('country').textContent = countryCode;
    document.getElementById('temperature').textContent = Math.round(data.current_weather.temperature);
    
    // Get current hour index
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentIndex = currentHour;
    
    // Get current humidity
    document.getElementById('humidity').textContent = Math.round(data.hourly.relativehumidity_2m[currentIndex]);
    document.getElementById('wind-speed').textContent = data.current_weather.windspeed;
    
    // Set weather description based on WMO weather codes
    const weatherCode = data.current_weather.weathercode;
    const description = getWeatherDescription(weatherCode);
    document.getElementById('description').textContent = description;
    
    // Set feels like temperature (using current temperature as approximation)
    document.getElementById('feels-like').textContent = Math.round(data.current_weather.temperature);
    
    // Update weather icon based on weather code
    const iconUrl = getWeatherIcon(weatherCode);
    document.getElementById('weather-icon').src = iconUrl;
}

// Function to get weather description from WMO weather code
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm'
    };
    return weatherCodes[code] || 'Unknown';
}

// Function to get weather icon based on weather code
function getWeatherIcon(code) {
    let iconName;
    if (code === 0) iconName = '01d';  // Clear sky
    else if (code === 1 || code === 2) iconName = '02d';  // Partly cloudy
    else if (code === 3) iconName = '04d';  // Overcast
    else if (code === 45 || code === 48) iconName = '50d';  // Foggy
    else if (code >= 51 && code <= 55) iconName = '09d';  // Drizzle
    else if (code >= 61 && code <= 65) iconName = '10d';  // Rain
    else if (code >= 71 && code <= 77) iconName = '13d';  // Snow
    else if (code >= 80 && code <= 82) iconName = '09d';  // Rain showers
    else if (code === 95) iconName = '11d';  // Thunderstorm
    else iconName = '50d';  // Default
    
    return `https://openweathermap.org/img/wn/${iconName}@2x.png`;
}

// Add event listener for Enter key in the input field
document.getElementById('location-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});
