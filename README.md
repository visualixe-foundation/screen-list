# Screen List

Personal movie & series watchlist — title, year, and actors.

**Live site:** https://screen-list.vercel.app/

Built as a simple static site (no framework, no database, no API key required).

## Features

- Search by title or actor
- Filter by type (Movie / Series)
- Actor chips (people who appear 2+ times)
- Sort A–Z / Newest / Oldest / By year
- Clean dark cinematic UI
- Installable as a PWA (PNG icons for Android/iOS)
- All data lives in `movies.js` (posters in `posters.js`)

## Adding a movie

Open `movies.js` and add a new object to the array:

```js
{
  "title": "Movie Title",
  "year": "2024",
  "type": "Movie",   // or "Series"
  "cast": ["Actor One", "Actor Two"],
  "tags": []         // optional, e.g. ["Animation"]
}
```

Save → push to GitHub → Vercel redeploys automatically.

You can also use **+ Add** on the site (PIN-gated, local-only). Export JSON from the admin form and paste into `movies.js` to make it permanent.

Optional: paste an [OMDb](https://www.omdbapi.com/) API key in admin to auto-fetch missing posters.

## License

Personal use. Feel free to fork and adapt.
