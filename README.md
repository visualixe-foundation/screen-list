# Film Journal

Personal movie & series watchlist — title, year, and actors.

Built as a simple static site (no framework, no database, no API key required).

## Features

- Search by title or actor
- Filter by type (Movie / Series)
- Actor chips (people who appear 2+ times)
- Sort A–Z / Newest / Oldest
- Clean dark cinematic UI
- All data lives in one file: `movies.js`

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

## Deploy

This is a pure static site. On Vercel:

1. Import the repo
2. Framework Preset: **Other**
3. Leave build & output settings empty
4. Deploy

## License

Personal use. Feel free to fork and adapt.
