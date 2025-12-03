document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = "640d57d7efff215d5628d568a5f4611b"; 
    const API_URL = "https://api.openweathermap.org/data/2.5/weather";

    // DOM Elements
    const weatherCard = document.querySelector('.weather-card');
    const cityNameEl = document.getElementById('city-name');
    const dateTimeEl = document.getElementById('date-time');
    const weatherIconEl = document.getElementById('weather-icon');
    const tempEl = document.getElementById('temp');
    const descriptionEl = document.getElementById('description');
    const windSpeedEl = document.getElementById('wind-speed');
    const humidityEl = document.getElementById('humidity');
    const pressureEl = document.getElementById('pressure');
    const feelsLikeEl = document.getElementById('feels-like');
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');

    // --- Utility Functions ---

    // Function to update the background theme based on weather condition
    function setWeatherTheme(condition) {
        // Clear all existing condition classes
        weatherCard.classList.remove('clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'night');
        document.body.className = ''; // Clear existing body background class

        const lowerCaseCondition = condition.toLowerCase();
        let themeClass = 'clear'; // Default to clear

        if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
            themeClass = 'rain';
        } else if (lowerCaseCondition.includes('cloud') || lowerCaseCondition.includes('mist')) {
            themeClass = 'clouds';
        } else if (lowerCaseCondition.includes('snow')) {
            themeClass = 'snow';
        } else if (lowerCaseCondition.includes('thunderstorm')) {
            themeClass = 'thunderstorm';
        }
        
        // Add the new class to the card and body
        weatherCard.classList.add(themeClass);
        document.body.style.backgroundImage = `linear-gradient(135deg, var(--bg-color-start), var(--bg-color-end))`;
    }

    // Function to map weather description to a Font Awesome icon
    function getWeatherIcon(iconCode) {
        // Full list of codes: https://openweathermap.org/weather-conditions
        switch (iconCode) {
            case '01d': return 'fas fa-sun';         // Clear Sky Day
            case '01n': return 'fas fa-moon';        // Clear Sky Night
            case '02d': // Few Clouds Day
            case '03d': // Scattered Clouds Day
            case '04d': // Broken Clouds Day
            case '02n': // Few Clouds Night
            case '03n': // Scattered Clouds Night
            case '04n': return 'fas fa-cloud';       // Clouds
            case '09d': // Shower Rain Day
            case '10d': // Rain Day
            case '09n': // Shower Rain Night
            case '10n': return 'fas fa-cloud-showers-heavy'; // Rain
            case '11d':
            case '11n': return 'fas fa-bolt';        // Thunderstorm
            case '13d':
            case '13n': return 'fas fa-snowflake';   // Snow
            case '50d':
            case '50n': return 'fas fa-smog';        // Mist/Fog
            default: return 'fas fa-question';
        }
    }

    // Function to format the current date and time
    function formatDateTime(timestamp) {
        const date = new Date(timestamp * 1000); // Convert s to ms
        const options = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        return date.toLocaleDateString('en-US', options);
    }

    // --- Data Fetching and Updating ---

    async function fetchWeatherData(city) {
        if (API_KEY === "YOUR_API_KEY") {
            console.error("API Key not set. Showing placeholder data.");
            // Display placeholder data for demonstration
            updateWeatherCard({
                city: city.charAt(0).toUpperCase() + city.slice(1),
                country: 'US',
                temp: 22,
                feels_like: 21,
                humidity: 65,
                wind_speed: 10,
                pressure: 1015,
                description: 'Overcast clouds',
                iconCode: '04d',
                timestamp: Math.floor(Date.now() / 1000)
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    alert('City not found. Please try again.');
                } else {
                    alert(`Error fetching data: ${response.statusText}`);
                }
                return;
            }

            const data = await response.json();
            
            const weatherData = {
                city: data.name,
                country: data.sys.country,
                temp: Math.round(data.main.temp),
                feels_like: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                wind_speed: (data.wind.speed * 3.6).toFixed(1), // Convert m/s to km/h
                pressure: data.main.pressure,
                description: data.weather[0].description,
                iconCode: data.weather[0].icon,
                timestamp: data.dt
            };

            updateWeatherCard(weatherData);

        } catch (error) {
            console.error('Fetch error:', error);
            alert('An error occurred while fetching the weather data.');
        }
    }

    function updateWeatherCard(data) {
        // Update basic info
        cityNameEl.textContent = `${data.city}, ${data.country || ''}`;
        dateTimeEl.textContent = formatDateTime(data.timestamp);
        
        // Update main weather section
        tempEl.textContent = data.temp;
        descriptionEl.textContent = data.description;
        weatherIconEl.className = `${getWeatherIcon(data.iconCode)} weather-icon`;

        // Update details grid
        windSpeedEl.textContent = `${data.wind_speed} km/h`;
        humidityEl.textContent = `${data.humidity}%`;
        pressureEl.textContent = `${data.pressure} hPa`;
        feelsLikeEl.textContent = `${data.feels_like}°C`;

        // Apply theme/background based on weather condition
        setWeatherTheme(data.description);
    }

    // --- Event Listeners ---
    
    // Search button click handler
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
            cityInput.value = ''; // Clear input after search
        }
    });

    // Allow search on pressing Enter key
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Load initial weather for a default city (e.g., London or a placeholder)
    fetchWeatherData('Dharapuram');
});
