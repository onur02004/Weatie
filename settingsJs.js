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

function saveSettings() {
  const unit = document.getElementById("tempUnit").value;
  const dark = document.getElementById("darkMode").checked;

  localStorage.setItem("weatie_unit", unit);
  localStorage.setItem("weatie_dark", dark);

  alert("Einstellungen gespeichert!");
}

// Einstellungen laden, wenn vorhanden
document.addEventListener("DOMContentLoaded", () => {
  const unit = localStorage.getItem("weatie_unit");
  const dark = localStorage.getItem("weatie_dark");

  if (unit) document.getElementById("tempUnit").value = unit;
  if (dark === "true") document.getElementById("darkMode").checked = true;
  if (cities) document.getElementById("favCities").value = cities;
});

<<<<<<< HEAD

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
=======
const darkToggle = document.getElementById("darkMode");

document.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("weatie_theme");

  if (mode === "light") {
    document.body.classList.add("light-mode");
    darkToggle.checked = false;
  } else {
    document.body.classList.remove("light-mode");
    darkToggle.checked = true;
    localStorage.setItem("weatie_theme", "dark");
  }
});

darkToggle.addEventListener("change", () => {
  if (darkToggle.checked) {
    document.body.classList.remove("light-mode");
    localStorage.setItem("weatie_theme", "dark");
  } else {
    document.body.classList.add("light-mode");
    localStorage.setItem("weatie_theme", "light");
  }
});

function frageNachStandort() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            alert("Dein Standort:\nBreitengrad: " + lat + "\nLängengrad: " + lon);
          },
          function(error) {
            alert("Fehler bei der Standortabfrage: " + error.message);
          }
        );
      } else {
        alert("Geolocation wird von deinem Browser nicht unterstützt.");
      }
    }
>>>>>>> eedf592202c4d29be689e6f9cecd742dba7d5c72
