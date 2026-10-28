/* Shared, early theme initialization; no analytics or form dependencies. */
(() => {
  'use strict';
  const key = 'cupsofcode-theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark', 'system'].includes(value) ? value : 'system';
  let preference = 'system';
  try { preference = valid(localStorage.getItem(key)); } catch (_) {}
  function apply() {
    const dark = preference === 'dark' || (preference === 'system' && media.matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.colorScheme = dark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#1c201d' : '#fefdfc';
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = preference; });
  }
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { preference = valid(event.newValue); apply(); }
  });
  function mount() {
    const header = document.querySelector('.site-header, body > header');
    if (!header || header.querySelector('[data-theme-select]')) return;
    const label = document.createElement('label');
    label.className = 'theme-control';
    const caption = document.createElement('span');
    caption.textContent = 'Theme';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Color theme');
    select.setAttribute('data-theme-select', '');
    for (const value of ['system', 'light', 'dark']) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value[0].toUpperCase() + value.slice(1);
      select.append(option);
    }
    select.addEventListener('change', () => {
      preference = valid(select.value);
      try { localStorage.setItem(key, preference); } catch (_) {}
      apply();
    });
    label.append(caption, select);
    header.append(label);
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
