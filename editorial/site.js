(() => {
  const copyFeed = document.querySelector('[data-copy-feed]');
  if (copyFeed) copyFeed.addEventListener('click', async () => {
    const address = document.getElementById('rss-url');
    const status = document.querySelector('[data-feed-status]');
    try { await navigator.clipboard.writeText(address.value); status.textContent = 'Feed address copied. Paste it into your RSS reader.'; }
    catch { address.focus(); address.select(); address.setSelectionRange(0, address.value.length); status.textContent = 'The address is selected. Copy it, then paste it into your RSS reader.'; }
  });
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menu && nav) {
    const close = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); menu.focus(); } });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  }
  const list = document.querySelector('[data-writing-list]');
  if (list) {
    let topic = 'all';
    const search = list.querySelector('[data-list-search]');
    const rows = [...list.querySelectorAll('[data-entry]')];
    const update = () => {
      const query = search.value.trim().toLowerCase();
      let count = 0;
      rows.forEach(row => { const show = (topic === 'all' || row.dataset.topic.trim() === topic) && row.dataset.title.includes(query); row.hidden = !show; if (show) count++; });
      list.querySelector('[data-result-count]').textContent = count + (count === 1 ? ' piece' : ' pieces') + ' in the notebook';
      list.querySelector('[data-no-results]').hidden = count !== 0;
    };
    list.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      topic = button.dataset.filter;
      list.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      update();
    }));
    search.addEventListener('input', update);
  }
  document.querySelectorAll('.prose pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'copy-code'; button.textContent = 'Copy code'; button.setAttribute('aria-label', 'Copy code to clipboard');
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.innerText); button.textContent = 'Copied'; }
      catch { button.textContent = 'Select code to copy'; const selection = window.getSelection(); const range = document.createRange(); range.selectNodeContents(code); selection.removeAllRanges(); selection.addRange(range); }
      setTimeout(() => { button.textContent = 'Copy code'; }, 2500);
    });
    pre.prepend(button);
  });
  const siteSearch = document.querySelector('[data-site-search]');
  if (siteSearch) {
    const form = siteSearch.querySelector('form');
    const input = form.querySelector('input');
    const status = siteSearch.querySelector('[data-search-status]');
    const results = siteSearch.querySelector('[data-search-results]');
    let index;
    let request = 0;
    const run = async () => {
      const current = ++request;
      const query = input.value.trim().toLowerCase();
      results.replaceChildren();
      if (!query) { status.textContent = 'Search articles, talks, and pages.'; return; }
      status.textContent = 'Looking through the notebook…';
      try {
        if (!index) { const response = await fetch(siteSearch.dataset.index); if (!response.ok) throw new Error('Index unavailable'); index = await response.json(); }
        if (current !== request) return;
        const terms = query.split(/\s+/);
        const hits = index.filter(item => terms.every(term => (item.title + ' ' + item.content).toLowerCase().includes(term))).slice(0, 30);
        status.textContent = hits.length ? hits.length + (hits.length === 1 ? ' result' : ' results') : 'No matches yet. Try a different word.';
        hits.forEach(item => {
          const row = document.createElement('article'); row.className = 'post-row';
          const date = document.createElement('span'); date.className = 'reading-time'; date.textContent = item.date;
          const body = document.createElement('div'); const heading = document.createElement('h3'); const link = document.createElement('a');
          link.href = new URL(item.permalink, location.href).pathname; link.textContent = item.title; heading.append(link);
          const excerpt = document.createElement('p'); excerpt.textContent = item.content.slice(0, 180) + '…'; body.append(heading, excerpt);
          row.append(date, body); results.append(row);
        });
      } catch { status.textContent = 'Search could not load. You can browse all writing from the menu.'; }
    };
    form.addEventListener('submit', e => { e.preventDefault(); const url = new URL(location.href); url.searchParams.set('q', input.value); history.replaceState(null, '', url); run(); });
    input.value = new URLSearchParams(location.search).get('q') || '';
    if (input.value) run();
  }
})();
