(function () {
  var storageKey = "theme-preference";
  var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    return localStorage.getItem(storageKey);
  }

  function getPreferredTheme() {
    return mediaQuery.matches ? "dark" : "light";
  }

  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || getStoredTheme() || getPreferredTheme();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;

    var toggleButton = document.getElementById("theme-toggle");
    if (!toggleButton) {
      return;
    }

    var isDark = theme === "dark";
    toggleButton.textContent = isDark ? "☀" : "☾";
    toggleButton.setAttribute("aria-pressed", isDark ? "true" : "false");
    toggleButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    toggleButton.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  function setTheme(theme, persist) {
    applyTheme(theme);
    if (persist) {
      localStorage.setItem(storageKey, theme);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getCurrentTheme());

    var toggleButton = document.getElementById("theme-toggle");
    if (toggleButton) {
      toggleButton.addEventListener("click", function () {
        var nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
        setTheme(nextTheme, true);
      });
    }

    if (!getStoredTheme()) {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", function (event) {
          applyTheme(event.matches ? "dark" : "light");
        });
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(function (event) {
          applyTheme(event.matches ? "dark" : "light");
        });
      }
    }
  });
})();
