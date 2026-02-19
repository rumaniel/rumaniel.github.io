(function () {
  var storageKey = "theme-preference";
  var mediaQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function normalizeTheme(value) {
    return value === "dark" || value === "light" ? value : null;
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (_) {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (_) {}
  }

  function getStoredTheme() {
    return normalizeTheme(readStoredTheme());
  }

  function getPreferredTheme() {
    return mediaQuery && mediaQuery.matches ? "dark" : "light";
  }

  function getCurrentTheme() {
    return normalizeTheme(document.documentElement.getAttribute("data-theme")) || getStoredTheme() || getPreferredTheme();
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
    var normalizedTheme = normalizeTheme(theme) || getPreferredTheme();
    applyTheme(normalizedTheme);
    if (persist) {
      writeStoredTheme(normalizedTheme);
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

    if (!getStoredTheme() && mediaQuery) {
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
