/* Applies public POSTERS map + localStorage OMDb cache */
(function () {
  const LS_POSTERS = 'screenlist_posters';
  const LS_OMDB = 'screenlist_omdb_key';

  function cache() {
    try { return JSON.parse(localStorage.getItem(LS_POSTERS) || '{}'); }
    catch (e) { return {}; }
  }
  function save(c) { localStorage.setItem(LS_POSTERS, JSON.stringify(c)); }
  function key(m) { return (m.title || '') + '|' + (m.year || ''); }

  window.applyPosterCache = function (list) {
    const c = cache();
    const pub = (typeof POSTERS !== 'undefined' && POSTERS) ? POSTERS : {};
    (list || []).forEach(function (m) {
      if (m.poster) return;
      var k = key(m);
      if (pub[k]) m.poster = pub[k];
      else if (c[k]) m.poster = c[k];
    });
  };

  window.fetchPostersFromOmdb = async function (list, onProgress) {
    const apiKey = localStorage.getItem(LS_OMDB);
    if (!apiKey || !list || !list.length) return 0;
    const c = cache();
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (m.poster) continue;
      const pk = key(m);
      if (c[pk]) { m.poster = c[pk]; continue; }
      try {
        const y = String(m.year || '').match(/\d{4}/);
        let url = 'https://www.omdbapi.com/?t=' + encodeURIComponent(m.title) + '&apikey=' + encodeURIComponent(apiKey);
        if (y) url += '&y=' + y[0];
        if (m.type === 'Series') url += '&type=series';
        const data = await fetch(url).then(function (r) { return r.json(); });
        if (data && data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
          m.poster = data.Poster;
          c[pk] = data.Poster;
          n++;
          if (onProgress && n % 6 === 0) { save(c); onProgress(n); }
        }
      } catch (e) {}
      await new Promise(function (r) { setTimeout(r, 110); });
    }
    save(c);
    if (onProgress) onProgress(n);
    return n;
  };

  window.setOmdbKey = function (k) {
    if (k) localStorage.setItem(LS_OMDB, k.trim());
  };
})();
