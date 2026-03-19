(function () {
  const THEME_KEY = 'tagvault_theme';
  const DARK_QUERY = '(prefers-color-scheme: dark)';
  const CORE_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap';
  const EXTENDED_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=Fira+Sans:wght@400;500;700&family=Lexend:wght@400;500;700&family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;500;700&family=Manrope:wght@400;500;700;800&family=Merriweather:wght@400;700&family=Nunito:wght@400;600;700;800&family=Open+Sans:wght@400;600;700&family=Oswald:wght@400;500;700&family=Outfit:wght@400;500;700;800&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Raleway:wght@400;500;700;800&family=Roboto+Slab:wght@400;500;700&family=Source+Sans+3:wght@400;600;700&family=Space+Grotesk:wght@400;500;700&display=swap';

  function ensureLink(id, rel, href, crossOrigin) {
    let link = document.getElementById(id);
    if (link) return link;

    link = document.createElement('link');
    link.id = id;
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
    return link;
  }

  function ensureFontPreconnects() {
    ensureLink('tagvault-fonts-preconnect-api', 'preconnect', 'https://fonts.googleapis.com');
    ensureLink('tagvault-fonts-preconnect-static', 'preconnect', 'https://fonts.gstatic.com', 'anonymous');
  }

  function ensureTagVaultFontPack(kind) {
    const target = kind === 'extended' ? 'extended' : 'core';
    ensureFontPreconnects();
    ensureLink('tagvault-fonts-core', 'stylesheet', CORE_FONT_HREF);
    if (target === 'extended') {
      ensureLink('tagvault-fonts-extended', 'stylesheet', EXTENDED_FONT_HREF);
    }
  }

  function getStoredTheme() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  }

  function getPreferredTheme() {
    const stored = getStoredTheme();
    if (stored) return stored;

    try {
      return window.matchMedia && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  function syncThemeToggles(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => {
      toggle.checked = theme === 'light';
      toggle.setAttribute('aria-checked', String(theme === 'light'));
      toggle.title = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
    });
  }

  function applyTheme(theme, persist) {
    const resolved = theme === 'dark' ? 'dark' : 'light';
    const root = document.documentElement;

    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, resolved);
      } catch {
        // Ignore storage failures and keep the chosen theme for this session.
      }
    }

    if (document.body) syncThemeToggles(resolved);
    return resolved;
  }

  function initTagVaultTheme() {
    return applyTheme(getPreferredTheme(), false);
  }

  function mountThemeToggles() {
    const currentTheme = applyTheme(getPreferredTheme(), false);
    syncThemeToggles(currentTheme);

    document.addEventListener('change', (event) => {
      const toggle = event.target;
      if (!toggle || !toggle.matches('[data-theme-toggle]')) return;

      const nextTheme = toggle.checked ? 'light' : 'dark';
      applyTheme(nextTheme, true);
      syncThemeToggles(nextTheme);
    });

    try {
      const media = window.matchMedia(DARK_QUERY);
      if (!media.addEventListener) return;

      media.addEventListener('change', (event) => {
        if (getStoredTheme()) return;
        const nextTheme = event.matches ? 'dark' : 'light';
        applyTheme(nextTheme, false);
        syncThemeToggles(nextTheme);
      });
    } catch {
      // MatchMedia support is optional.
    }
  }

  window.initTagVaultTheme = initTagVaultTheme;
  window.setTagVaultTheme = function (theme) {
    return applyTheme(theme, true);
  };
  window.ensureTagVaultFontPack = ensureTagVaultFontPack;

  initTagVaultTheme();
  document.addEventListener('DOMContentLoaded', mountThemeToggles);
})();
