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

function toggleSidebar() {
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}


function checkWhiteMode() {
  const mode = localStorage.getItem("weatie_theme");

  if (mode === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
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
  let runde = 0;
  let animationIsMulti = window.innerWidth > 800; //if desktop, top animation contains multiple images, else single image
  let timer;

  function cycleMulti() {
    // remove active aus all, add zu current
    panels.forEach(p => p.classList.remove('active'));
    panels[runde].classList.add('active');
    runde = (runde + 1) % panels.length;
  }

  function cycleSingle() {
    // hide alle außer erstes panel
    panels.forEach((p, i) => {
      p.style.display = i === 0 ? '' : 'none';
    });
    // update image vom ersten panel
    panels[0].style.backgroundImage = images[runde];
    runde = (runde + 1) % images.length;
  }

  function startCycling() {
    clearInterval(timer);
    runde = 0;
    if (window.innerWidth > 800) {
      animationIsMulti = true;
      // Alle sichtbaren Panels wiederherstellen
      panels.forEach((p, i) => {
        p.style.display = '';
        p.style.backgroundImage = images[i];
      });
      cycleMulti();
      timer = setInterval(cycleMulti, 5000);
    } else {
      animationIsMulti = false;
      panels.forEach((p, i) => p.style.display = i === 0 ? '' : 'none');
      cycleSingle();
      timer = setInterval(cycleSingle, 5000);
    }
  }

  // kick things off
  startCycling();

  // re-start, wenn 800px breakpoint überschritten
  window.addEventListener('resize', () => {
    const nowMulti = window.innerWidth > 800;
    if (nowMulti !== animationIsMulti) startCycling();
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



  document.querySelectorAll('.card').forEach(card => {
    // Get title Element in current card
    const titleElement = card.querySelector('.cardTitle');

    // Wenn kein title Element oder "+" card, skip
    // trim() Methode entfernt Leerzeichen von beiden Enden eines Strings
    if (!titleElement || titleElement.textContent.trim() === '+') {
      return;
    }

    // Stadt-Name aus card title extrahieren
    const city = (titleElement.textContent.toLowerCase());
    const cityCoordinates = coords[city]; // Get Koordinaten von coords objekt

    if (!cityCoordinates) {
      console.warn(`No coordinates defined for city: ${city}. Skipping weather fetch.`);
      return;
    }

    card.addEventListener('click', () => {
      console.log(`Card clicked for city: ${city} (${cityCoordinates.lat}, ${cityCoordinates.lon})`);
      window.location.href = `cityDetails.html?city=${encodeURIComponent(city)}&lat=${cityCoordinates.lat}&lon=${cityCoordinates.lon}`;
    });

    // url für Open-Meteo API konstruieren
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: cityCoordinates.lat,
      longitude: cityCoordinates.lon,
      current_weather: 'true',              // current Wetter-Daten anfordern
      hourly: 'relativehumidity_2m', // stündliche Luftfeuchtigkeit in 2m Höhe anfordern
      timezone: 'auto'               // automatisch Zeitzone detecten
    });

    // Get Wetter-Daten von API
    fetch(url)
      .then(res => {
        // Check, ob HTTP-Antwort erfolgreich
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json(); // Parse JSON Antwort
      })
      .then(data => {
        // 1) Render Temperatur
        const temperatruElement = card.querySelector('.temperaturText');
        const temperature = data.current_weather?.temperature;
        const tempUnit = localStorage.getItem("weatie_unit") || "C"; // Standard: Celsius

        if (temperatruElement && typeof temperature === 'number') {
          if (tempUnit === "F") {
            const fahrenheit = (temperature * 9 / 5) + 32;
            temperatruElement.textContent = `${Math.round(fahrenheit)}°F`;
          } else {
            temperatruElement.textContent = `${Math.round(temperature)}°C`;
          }
        } else {
          console.warn(`Temperature data missing or invalid for ${city}.`);
          if (temperatruElement) temperatruElement.textContent = 'N/A';
        }

        // 2) Render Luftfeuchtigkeit
        const humidityElement = card.querySelector('.cardText');
        const hourlyTimes = data.hourly?.time;
        const hourlyHumidities = data.hourly?.relativehumidity_2m;
        const currentTime = data.current_weather?.time;

        if (humidityElement && Array.isArray(hourlyTimes) && Array.isArray(hourlyHumidities) && currentTime) {
          const currentTimestamp = new Date(currentTime).getTime();

          let closestRunde = -1;
          let minDiff = Infinity; // Mit großer Differenz initialisieren

          // stündlich wiederholen, um beste Übereinstimmung zu finden
          for (let i = 0; i < hourlyTimes.length; i++) {
            const hourlyTimestamp = new Date(hourlyTimes[i]).getTime();
            const diff = Math.abs(currentTimestamp - hourlyTimestamp); // Differenz berechnen

            if (diff < minDiff) {
              minDiff = diff;
              closestRunde = i;
            }
          }

          // Wenn ein ähnlicher Index gefunden wird und die Differenz innerhalb eines angemessenen Schwellenwerts liegt (z.B. 1 h = 3600000 ms)
          if (closestRunde !== -1 && minDiff < 3600000) { // Prüfen, ob Zeitunterschied weniger als eine Stunde ist
            humidityElement.textContent = `${hourlyHumidities[closestRunde]}%`;
          } else {
            humidityElement.textContent = `Hum. err`;
            console.warn(`No suitable hourly humidity data found for ${city} at ${currentTime}.`);
          }
        } else {
          console.warn(`Hourly humidity data missing or invalid for ${city}.`);
          if (humidityElement) humidityElement.textContent = 'Humidity: N/A';
        }

        //3 Images
        const weatherIconElement = card.querySelector('.weatherIcon');
        if (weatherIconElement) {
          const wc = data.current_weather.weathercode;
          const time = data.current_weather.time;                     // z.B. "2025-06-20T14:00"
          const hour = new Date(time).getHours();                     // lokale Stunde
          const iconF = mapWeatherCodeToIcon(wc, hour);
          weatherIconElement.src = `Images/weather_icons/${iconF}`;
          weatherIconElement.alt = `Weather icon ${iconF}`;
        }
      })
      .catch(err => {
        // Catch Fehler während der"Fetch-Operation"
        console.error(`Failed fetching weather for ${city}:`, err);
        const tempElement = card.querySelector('.temperaturText');
        const humElement = card.querySelector('.cardText');
        if (tempElement) tempElement.textContent = 'Error';
        if (humElement) humElement.textContent = 'Error';
      });
  });
});


function handleSearch() {
  const input = document.getElementById('city-input');
  const city = formatCityNameForUrl(input.value.trim());
  if (city) {
    const cityCoords = coords[city];
    if (cityCoords) {
      window.location = `cityDetails.html?city=${encodeURIComponent(city)}&lat=${cityCoords.lat}&lon=${cityCoords.lon}`;
    } else {
      alert(`No coordinates defined for city: >${city}<. Please try another city.`);
    }
  }
}

function formatCityNameForUrl(cityName) {
  return cityName.replace(/\s/g, '').replace(/\./g, '').toLowerCase();
}