// Movies load from /data/m*.json
let MOVIES = [];
async function loadMovies() {
  const ids = [0,1,2,3];
  const parts = await Promise.all(ids.map(function(i) {
    return fetch('/data/m' + i + '.json').then(function(r) { return r.json(); });
  }));
  MOVIES = parts.reduce(function(a,b) { return a.concat(b); }, []);
  return MOVIES;
}
