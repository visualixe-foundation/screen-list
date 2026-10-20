/* Applies public POSTERS map + localStorage OMDb cache */
(function () {
  const LS_POSTERS = 'screenlist_posters';
  const LS_OMDB = 'screenlist_omdb_key';

  // OMDb search aliases (title as stored -> title/year for API)
  const ALIASES = {
    'Your Name.|2016': { t: 'Your Name', y: '2016' },
    'Your Name.|': { t: 'Your Name', y: '2016' },
    'Suzume|2022': { t: 'Suzume', y: '2022' },
    'Weathering with You|2019': { t: 'Weathering with You', y: '2019' },
    'Like Stars on Earth|2007': { t: 'Taare Zameen Par', y: '2007' },
    'The Avengers|2012': { t: 'The Avengers', y: '2012' },
    'Frozen II|2019': { t: 'Frozen II', y: '2019' },
    'Moana 2|2024': { t: 'Moana 2', y: '2024' },
    'Inside Out 2|2024': { t: 'Inside Out 2', y: '2024' },
    'Hotel Transylvania 3: Summer Vacation|2018': { t: 'Hotel Transylvania 3', y: '2018' },
    'Hotel Transylvania: Transformania|2022': { t: 'Hotel Transylvania Transformania', y: '2022' },
    'Guardians of the Galaxy Vol. 3|2023': { t: 'Guardians of the Galaxy Vol. 3', y: '2023' },
    'Mad Max 2|1981': { t: 'Mad Max 2', y: '1981' }
  };

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
        const alias = ALIASES[pk] || ALIASES[(m.title || '') + '|'];
        const searchTitle = alias ? alias.t : m.title;
        const y = alias && alias.y ? alias.y : (String(m.year || '').match(/\d{4}/) || [])[0];
        let url = 'https://www.omdbapi.com/?t=' + encodeURIComponent(searchTitle) + '&apikey=' + encodeURIComponent(apiKey);
        if (y) url += '&y=' + y;
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
