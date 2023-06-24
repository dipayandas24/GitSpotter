"use strict";

const rootElement = document.documentElement;
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (sessionStorage.getItem("theme")) {
  rootElement.dataset.theme = sessionStorage.getItem("theme");
} else {
  rootElement.dataset.theme = prefersDarkMode ? "dark" : "light";
}

let isButtonPressed = false;

const toggleTheme = function () {
  isButtonPressed = !isButtonPressed;

  this.setAttribute("aria-pressed", isButtonPressed);

  rootElement.setAttribute(
    "data-theme",
    rootElement.dataset.theme === "light" ? "dark" : "light"
  );

  sessionStorage.setItem("theme", rootElement.dataset.theme);
};

window.addEventListener("load", function () {
  const themeButton = document.querySelector("[data-theme-btn]");

  themeButton.addEventListener("click", toggleTheme);
});
