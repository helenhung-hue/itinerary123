# Sydney · 雪梨之旅 🇦🇺

A small, elegant **travel-journal web app** for the Sydney trip (20–27 June 2026).
Styled after a cream / serif itinerary app, built as a single static page — no
backend, no build step, no dependencies.

## Features

- **首頁 / Home** — today's itinerary at a glance + a feature grid
- **行程 / Plans** — full day-by-day timeline grouped by Breakfast → Night, with
  weather, booking chips, and hotel for each night
- **地圖 / Map** — every place across the trip, one tap to open in Google Maps
- **記帳 / Wallet** — live AUD → TWD converter
- **景點 / Saved** — backup / wishlist spots not yet scheduled
- Swipeable date pills + progress rail; auto-selects the current day

## Run it locally

It's just static files — open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Editing the trip

All trip content lives in **`js/data.js`** — edit titles, times, notes,
`booked` flags, the `saved` list, and the `rateToTWD` exchange rate there.
No rebuild needed; just refresh.

## Do we need a server? — No.

This is a **static site**, so there is nothing to "run" on a server. You have
two easy options:

1. **GitHub Pages (recommended, free).** In the repo: *Settings → Pages →
   Build and deployment → Deploy from a branch*, pick this branch and `/ (root)`.
   In ~1 minute you get a public `https://<user>.github.io/<repo>/` URL that
   works on your phone, no install needed.
2. **No hosting at all.** Copy the folder to your phone / laptop and open
   `index.html` offline. Everything except the Google Maps links works without
   internet (those links just need a connection when tapped).

You'd only need a real server/backend later if you wanted accounts, syncing
edits between people live, or push notifications — none of which this needs.

## Structure

```
index.html      app shell + bottom nav
css/styles.css  the cream/serif theme
js/data.js      ← the itinerary (edit this)
js/app.js       view rendering & interactions
```
