const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

const coords = {
    Weingarten:    { lat: 48.1716, lon: 9.5367 },
    Ravensburg:    { lat: 47.7895, lon: 9.6125 },
    Stuttgart:     { lat: 48.7758, lon: 9.1829 },
    Köln:          { lat: 50.9375, lon: 6.9603 },
    Paris:         { lat: 48.8566, lon: 2.3522 },
    Istanbul:      { lat: 41.0082, lon: 28.9784 },
    Sydney:        { lat: -33.8688, lon: 151.2093 },
    'New York':    { lat: 40.7128, lon: -74.0060 },
    Rome:          { lat: 41.9028, lon: 12.4964 },
    'St. Petersburg': { lat: 59.9343, lon: 30.3351 }
};

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
const city  = params.get('city');
const c = coords[city];