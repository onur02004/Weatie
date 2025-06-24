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
