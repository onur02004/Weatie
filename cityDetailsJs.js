const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

  const coords = {
    weingarten: { lat: 48.1716, lon: 9.5367 },
    ravensburg: { lat: 47.7895, lon: 9.6125 },
    stuttgart: { lat: 48.7758, lon: 9.1829 },
    köln: { lat: 50.9375, lon: 6.9603 },
    paris: { lat: 48.8566, lon: 2.3522 },
    istanbul: { lat: 41.0082, lon: 28.9784 },
    sydney: { lat: -33.8688, lon: 151.2093 },
    'new york': { lat: 40.7128, lon: -74.0060 },
    rome: { lat: 41.9028, lon: 12.4964 },
    'st. petersburg': { lat: 59.9343, lon: 30.3351 }
  };

  AOS.init();
  checkWhiteMode();

function checkWhiteMode() {
    const mode = localStorage.getItem("weatie_theme");

    if (mode === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
}

function toggleSidebar() {
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}

function toggleSubMenu(button) {

  if (!button.nextElementSibling.classList.contains('show')) {
    closeAllSubMenus()
  }

  button.nextElementSibling.classList.toggle('show')
  button.classList.toggle('rotate')

  if (sidebar.classList.contains('close')) {
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
  }
}

function closeAllSubMenus() {
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show')
    ul.previousElementSibling.classList.remove('rotate')
  })
}


const params = new URLSearchParams(window.location.search);
const city = params.get('city');
const c = coords[city];

function formatCityNameForUrl(cityName) {
  return cityName.replace(/\s/g, '').replace(/\./g, '');
}

function initPage() {
  if (!c) {
    console.error('City coordinates not found');
    return;
  } else {
    console.log(`Coordinates for ${city}:`, c);
  }


  //changing the Title
  const titleElement = document.querySelector('h2.title');
  titleElement.textContent = city;

  //Changing the background image
  const backgroundImage = document.querySelector('.topContainer');
  const formattedCityName = formatCityNameForUrl(city);
  const backgroundImageUrl = `/Images/LocationBG/${formattedCityName}.JPG`;
  backgroundImage.style.backgroundImage = `linear-gradient(25deg, #000000 0%, transparent 50%, #000000 100%), url('${backgroundImageUrl}')`;

  getWeatherInfo();
}

async function getWeatherInfo() {
  if (!c) {
    console.error('City coordinates not available for weather fetch.');
    return;
  }

  // *** Replace with your WeatherAPI.com API Key ***
  const API_KEY = 'c0454540f64f4f209ef185743252906'; // GET YOUR KEY FROM WEATHERAPI.COM

  const queryLocation = `${c.lat},${c.lon}`; // WeatherAPI uses lat,lon format

  // Forecast API for current, hourly, and daily (next 7-14 days)
  const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${queryLocation}&days=10&aqi=no&alerts=no`;

  // Historical API for yesterday's weather
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDateString = yesterday.toISOString().split('T')[0]; // Format YYYY-MM-DD
  const historicalUrl = `http://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${queryLocation}&dt=${yesterdayDateString}`;

  try {
    // --- Fetch historical data for yesterday ---
    const historyResponse = await fetch(historicalUrl);
    const historyData = await historyResponse.json();
    console.log('Historical Data (Yesterday):', historyData);

    if (historyData.error) {
      console.error('Error fetching historical weather:', historyData.error.message);
      alert(`Error fetching historical weather: ${historyData.error.message}`);
      // If historical fails, we can still proceed with current/forecast
    }

    // --- Fetch current and forecast data ---
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    console.log('Forecast Data (Current, Hourly, Daily):', forecastData);

    if (forecastData.error) {
      console.error('Error fetching forecast weather:', forecastData.error.message);
      alert(`Error fetching forecast weather: ${forecastData.error.message}`);
      return;
    }

    const current = forecastData.current;
    const forecastDays = forecastData.forecast.forecastday; // Array of daily forecasts

    // Update top container
    document.querySelector('.temperatur').textContent = `${Math.round(current.temp_c)}°C`;

    // Update most important container
    document.querySelector('.mostImportantContainer .stat:nth-child(1) .number').textContent = Math.round(current.feelslike_c) + '°C';
    // WeatherAPI has 'us-epa-index' for air quality, or you can check individual pollutants.
    // For simplicity, let's keep it 'N/A' or use a basic status if AQI is enabled.
    document.querySelector('.mostImportantContainer .stat:nth-child(2) .number').textContent = 'N/A';
    document.querySelector('.mostImportantContainer .stat:nth-child(3) .number').textContent = Math.round(current.wind_kph) + ' km/h';
    document.querySelector('.mostImportantContainer .stat:nth-child(4) .number').textContent = current.humidity + '%';

    // --- Populate Daily Weather Cards ---
    const dailyWeatherContainer = document.querySelector('.dailyWeatherContainer');
    dailyWeatherContainer.innerHTML = ''; // Clear existing cards

    // Add 'Gestern' card using historical data
    if (historyData.forecast && historyData.forecast.forecastday.length > 0) {
      const yesterdayTemp = historyData.forecast.forecastday[0].day.avgtemp_c;
      const yesterdayIcon = historyData.forecast.forecastday[0].day.condition.icon;
      const yesterdayCard = createDailyWeatherCard(Math.round(yesterdayTemp), 'Gestern', `https:${yesterdayIcon}`);
      dailyWeatherContainer.appendChild(yesterdayCard);
    } else {
      // Fallback if historical data is not available
      const yesterdayCard = createDailyWeatherCard(Math.round(current.temp_c), 'Gestern', `https:${current.condition.icon}`);
      dailyWeatherContainer.appendChild(yesterdayCard);
    }

    const daysOfWeek = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

    // Populate cards for "Heute" and the next 7 days (or as many as available, up to 10 days in this forecast API call)
    forecastDays.slice(0, 8).forEach((dayData, index) => { // slice(0, 8) gets today + next 7 days
      const date = new Date(dayData.date_epoch * 1000);
      let dayLabel = '';

      if (index === 0) {
        dayLabel = 'Heute';
      } else if (index === 1) {
        dayLabel = 'Morgen';
      } else {
        dayLabel = daysOfWeek[date.getDay()];
      }

      const card = createDailyWeatherCard(Math.round(dayData.day.avgtemp_c), dayLabel, `https:${dayData.day.condition.icon}`);
      dailyWeatherContainer.appendChild(card);
    });


    // --- Populate Hourly Weather Cards ---
    const hourlyWeatherContainer = document.querySelector('.hourlyWeatherDisplay'); // Changed selector
if (hourlyWeatherContainer) {
      hourlyWeatherContainer.innerHTML = ''; // Clear existing cards

      // WeatherAPI forecast provides hourly data for today and future days.
      // Let's get the hourly forecast for the current day
      const todayHourly = forecastDays[0].hour;

      // Filter to get only future hours from now
      const currentHour = new Date().getHours();
      const futureHourly = todayHourly.filter(hourData => {
        const hour = new Date(hourData.time_epoch * 1000).getHours();
        // If the hour is the current hour or later
        return hour >= currentHour;
      });

      // Display up to the next 24 hours, starting from the current hour
      futureHourly.slice(0, 24).forEach(hourData => {
        const date = new Date(hourData.time_epoch * 1000);
        const hour = date.getHours();
        const formattedHour = `${hour.toString().padStart(2, '0')}:00`;

        const card = createHourlyWeatherCard(Math.round(hourData.temp_c), formattedHour, `https:${hourData.condition.icon}`);
        hourlyWeatherContainer.appendChild(card);
        console.log(`Added hourly card for ${formattedHour}: ${Math.round(hourData.temp_c)}°C`);
      });
    }else{
      console.error('Hourly weather container not found. Err');
    }


    // --- Populate Details Div ---
    document.querySelector('.grid-item:nth-child(1) p').textContent = `${Math.round(current.temp_c)}°C`;
    document.querySelector('.grid-item:nth-child(2) p').textContent = `${Math.round(current.feelslike_c)}°C`;
    document.querySelector('.grid-item:nth-child(3) p').textContent = `${Math.round(current.wind_kph)} km/h`;
    document.querySelector('.grid-item:nth-child(4) p').textContent = `${current.cloud}%`; // WeatherAPI uses 'cloud' for cloud cover
    document.querySelector('.grid-item:nth-child(5) p').textContent = `${current.humidity}%`;

    // Update detail status messages based on values (example logic)
    document.querySelector('.grid-item:nth-child(1) h4').textContent = current.temp_c > 25 ? 'Warm' : 'Mild';
    document.querySelector('.grid-item:nth-child(2) h4').textContent = current.feelslike_c > 30 ? 'Very hot' : 'Normal';
    document.querySelector('.grid-item:nth-child(3) h4').textContent = current.wind_kph > 20 ? 'Breezy' : 'Light Air'; // Adjusted for km/h
    document.querySelector('.grid-item:nth-child(4) h4').textContent = current.cloud < 30 ? 'Mostly Sunny' : (current.cloud < 70 ? 'Partly Cloudy' : 'Cloudy');
    document.querySelector('.grid-item:nth-child(5) h4').textContent = current.humidity > 70 ? 'High' : (current.humidity < 40 ? 'Low' : 'Normal');

  } catch (error) {
    console.error('Error fetching weather data:', error);
    alert('Failed to fetch weather data. Please check console for more details and your API key.');
  }
}

function createDailyWeatherCard(temperature, label, iconUrl) {
  const card = document.createElement('div');
  card.classList.add('dailyWeatherCard');
  card.setAttribute('data-aos', 'zoom-out');
  card.innerHTML = `
        <div class="dailyWeatherCard-top-left">${temperature}°C</div>
        <div class="dailyWeatherCard-top-right">${label}</div>
        <img src="${iconUrl}" alt="Weather icon" class="dailyWeatherCard-center-image">
    `;
  return card;
}

function createHourlyWeatherCard(temperature, label, iconUrl) {
  const card = document.createElement('div');
  card.classList.add('hourlyWeatherCard');
  card.setAttribute('data-aos', 'zoom-in');
  card.innerHTML = `
        <div class="dailyWeatherCard-top-left">${temperature}°C</div>
        <div class="dailyWeatherCard-top-right">${label}</div>
        <img src="${iconUrl}" alt="Weather icon" class="hourlyWeatherCard-center-image">
    `;
  return card;
}

// Initial calls
initPage();
getWeatherInfo();