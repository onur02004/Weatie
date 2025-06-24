const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')


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


document.addEventListener('DOMContentLoaded', () => {
  const panels = Array.from(document.querySelectorAll('.animationpanel'));
  if (!panels.length) return;

  const images = panels.map(p => p.style.backgroundImage);
  let idx = 0;
  let isMulti = window.innerWidth > 800;
  let timer;

  function cycleMulti() {
    // remove active from all, add to current
    panels.forEach(p => p.classList.remove('active'));
    panels[idx].classList.add('active');
    idx = (idx + 1) % panels.length;
  }

  function cycleSingle() {
    // hide all except the first panel
    panels.forEach((p, i) => {
      p.style.display = i === 0 ? '' : 'none';
    });
    // update the first panel’s image
    panels[0].style.backgroundImage = images[idx];
    idx = (idx + 1) % images.length;
  }

  function startCycling() {
    clearInterval(timer);
    idx = 0;
    if (window.innerWidth > 800) {
      isMulti = true;
      // restore all panels visible
      panels.forEach((p, i) => {
        p.style.display = '';
        p.style.backgroundImage = images[i];
      });
      cycleMulti();
      timer = setInterval(cycleMulti, 5000);
    } else {
      isMulti = false;
      panels.forEach((p, i) => p.style.display = i === 0 ? '' : 'none');
      cycleSingle();
      timer = setInterval(cycleSingle, 5000);
    }
  }

  // kick things off
  startCycling();

  // re-start if we cross the 800px breakpoint
  window.addEventListener('resize', () => {
    const nowMulti = window.innerWidth > 800;
    if (nowMulti !== isMulti) startCycling();
  });




  const icon = document.getElementById('scrollIcon');

  function checkScroll() {
    if (window.scrollY > 0) {
      icon.classList.add('hidden');
    } else {
      icon.classList.remove('hidden');
    }
  }

  // run on load
  checkScroll();

  // run on every scroll event
  window.addEventListener('scroll', checkScroll);

  function mapWeatherCodeToIcon(code, hour) {
    // Decide day (d) vs night (n)
    const suffix = (hour >= 6 && hour < 18) ? 'd' : 'n';

    // Map WMO codes → OWM base codes
    let base;
    switch (code) {
      case 0: base = '01'; break; // clear sky
      case 1: case 2: base = '02'; break; // mainly/few clouds
      case 3: base = '03'; break; // scattered clouds
      case 45: case 48: base = '50'; break; // fog
      case 51: case 53: case 55: base = '09'; break; // drizzle
      case 61: case 63: case 65: base = '10'; break; // rain
      case 66: case 67: base = '13'; break; // freezing rain / sleet
      case 71: case 73: case 75:
      case 77: case 85: case 86: base = '13'; break; // snow
      case 80: case 81: case 82: base = '09'; break; // shower rain
      case 95: case 96: case 99: base = '11'; break; // thunderstorm
      default: base = '01';         // fallback to clear
    }

    return `${base}${suffix}@2x.png`;
  }

  const coords = {
    Weingarten: { lat: 48.1716, lon: 9.5367 },
    Ravensburg: { lat: 47.7895, lon: 9.6125 },
    Stuttgart: { lat: 48.7758, lon: 9.1829 },
    Köln: { lat: 50.9375, lon: 6.9603 },
    Paris: { lat: 48.8566, lon: 2.3522 },
    Istanbul: { lat: 41.0082, lon: 28.9784 },
    Sydney: { lat: -33.8688, lon: 151.2093 },
    'New York': { lat: 40.7128, lon: -74.0060 },
    Rome: { lat: 41.9028, lon: 12.4964 },
    'St. Petersburg': { lat: 59.9343, lon: 30.3351 }
  };

  document.querySelectorAll('.card').forEach(card => {
    // Get the title element within the current card
    const titleEl = card.querySelector('.cardTitle');

    // If there's no title element or it's the "+" card, skip processing
    // The trim() method removes whitespace from both ends of a string.
    if (!titleEl || titleEl.textContent.trim() === '+') {
      return;
    }

    // Extract the city name from the card title
    const city = titleEl.textContent.trim();
    const c = coords[city]; // Get coordinates from the coords object

    // If coordinates for the city are not defined, log a warning and skip
    if (!c) {
      console.warn(`No coordinates defined for city: ${city}. Skipping weather fetch.`);
      return;
    }

    card.addEventListener('click', () => {
      console.log(`Card clicked for city: ${city} (${c.lat}, ${c.lon})`);
      window.location.href = `cityDetails.html?city=${encodeURIComponent(city)}&lat=${c.lat}&lon=${c.lon}`;
    });

    // Construct the URL for the Open-Meteo API
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: c.lat,
      longitude: c.lon,
      current_weather: 'true',              // Request current weather data
      hourly: 'relativehumidity_2m', // Request hourly relative humidity at 2m
      timezone: 'auto'               // Automatically detect timezone
    });

    // Fetch weather data from the API
    fetch(url)
      .then(res => {
        // Check if the HTTP response was successful
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json(); // Parse the JSON response
      })
      .then(data => {
        // 1) Render Temperature
        const tempEl = card.querySelector('.temperaturText');
        const temperature = data.current_weather?.temperature;

        if (tempEl && typeof temperature === 'number') {
          tempEl.textContent = `${Math.round(temperature)}°C`;
        } else {
          console.warn(`Temperature data missing or invalid for ${city}.`);
          if (tempEl) tempEl.textContent = 'N/A';
        }

        // 2) Render Humidity
        const humEl = card.querySelector('.cardText');
        const hourlyTimes = data.hourly?.time;
        const hourlyHumidities = data.hourly?.relativehumidity_2m;
        const currentTime = data.current_weather?.time;

        if (humEl && Array.isArray(hourlyTimes) && Array.isArray(hourlyHumidities) && currentTime) {
          const currentTimestamp = new Date(currentTime).getTime(); // Convert current time to timestamp

          let closestIdx = -1;
          let minDiff = Infinity; // Initialize with a large difference

          // Iterate through hourly times to find the closest match
          for (let i = 0; i < hourlyTimes.length; i++) {
            const hourlyTimestamp = new Date(hourlyTimes[i]).getTime();
            const diff = Math.abs(currentTimestamp - hourlyTimestamp); // Calculate absolute difference

            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = i;
            }
          }

          // If a closest index is found and the difference is within a reasonable threshold (e.g., 1 hour = 3600000 ms)
          if (closestIdx !== -1 && minDiff < 3600000) { // Check if time difference is less than an hour
            humEl.textContent = `${hourlyHumidities[closestIdx]}%`;
          } else {
            humEl.textContent = `Hum. err`;
            console.warn(`No suitable hourly humidity data found for ${city} at ${currentTime}.`);
          }
        } else {
          console.warn(`Hourly humidity data missing or invalid for ${city}.`);
          if (humEl) humEl.textContent = 'Humidity: N/A';
        }

        //3 Images
        const weatherIconEl = card.querySelector('.weatherIcon');
        if (weatherIconEl) {
          const wc = data.current_weather.weathercode;
          const time = data.current_weather.time;                     // e.g. "2025-06-20T14:00"
          const hour = new Date(time).getHours();                     // local hour
          const iconF = mapWeatherCodeToIcon(wc, hour);
          weatherIconEl.src = `../Images/weather_icons/${iconF}`;
          weatherIconEl.alt = `Weather icon ${iconF}`;
        }
      })
      .catch(err => {
        // Catch any errors during the fetch operation
        console.error(`Failed fetching weather for ${city}:`, err);
        const tempEl = card.querySelector('.temperaturText');
        const humEl = card.querySelector('.cardText');
        if (tempEl) tempEl.textContent = 'Error';
        if (humEl) humEl.textContent = 'Error';
      });
  });
});

