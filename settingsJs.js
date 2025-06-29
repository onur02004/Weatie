function saveSettings() {
  const unit = document.getElementById("tempUnit").value;
  const dark = document.getElementById("darkMode").checked;
  const cities = document.getElementById("favCities").value;

  localStorage.setItem("weatie_unit", unit);
  localStorage.setItem("weatie_dark", dark);
  localStorage.setItem("weatie_cities", cities);

  alert("Einstellungen gespeichert!");
}

// Einstellungen laden, wenn vorhanden
document.addEventListener("DOMContentLoaded", () => {
  const unit = localStorage.getItem("weatie_unit");
  const dark = localStorage.getItem("weatie_dark");
  const cities = localStorage.getItem("weatie_cities");

  if (unit) document.getElementById("tempUnit").value = unit;
  if (dark === "true") document.getElementById("darkMode").checked = true;
  if (cities) document.getElementById("favCities").value = cities;
});


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
