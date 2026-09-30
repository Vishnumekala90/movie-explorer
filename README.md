# Movie Explorer – Discover Your Favorite Films

A responsive React web application for searching movies, browsing what is trending and saving favorites, powered by the [TMDb (The Movie Database) API](https://developer.themoviedb.org/docs).

Built as the **Loons Lab Developer Selection Test**.

- **Live demo:** _add your Vercel/Netlify URL here after deploying_
- **Repository:** _add your GitLab URL here_

## Screenshots

_Add screenshots here after running the app with your own TMDb key (login, home/trending, search results, movie details, favorites, dark mode, mobile view)._

## Problem statement

A startup needs a Movie Explorer web app that lets users search for movies, view details and discover trending films. The app must fetch real-time data from TMDb, handle API errors gracefully, support light/dark mode, persist the last search and a favorites list locally, and follow mobile-first responsive design.

## Features

**Mandatory**

- Login interface (username, password, Login button) with a demo front-end login flow
- Search bar with loading, empty-input, no-results and API-error states
- Responsive movie grid (2 / 3 / 4 / 5 columns) – each card shows poster, title, release year and rating, with clean fallbacks for missing data
- Movie details page (`/movie/:id`): poster, overview, rating, release date, runtime, genres, cast and trailer link
- Trending movies section on the Home page (TMDb trending endpoint)
- **Infinite scrolling** for search results (IntersectionObserver + TMDb pagination)
- Light / dark mode using the Material UI theme system, saved in `localStorage`
- User-friendly API error messages (invalid key, network, server errors, missing data) – raw Axios errors are never shown
- React Context API for shared movie state
- Last searched movie persisted in `localStorage` (restored after a refresh)
- Favorites saved in `localStorage` with a dedicated Favorites page
- React Router navigation: Login, Home, Movie Details, Favorites and a 404 page

**Bonus**

- Filter search results by genre, release year and minimum rating
- Embedded YouTube trailer (TMDb video data) in addition to the trailer link

_Not implemented:_ the optional "Load More" button (infinite scroll is used instead).

## Technology stack

| Purpose        | Technology                                   |
| -------------- | -------------------------------------------- |
| Framework      | React 19 (Create React App)                  |
| Routing        | React Router                                 |
| UI             | Material UI (MUI) + Emotion + MUI icons      |
| HTTP           | Axios                                        |
| State          | React Context API                            |
| Persistence    | `localStorage`                               |
| Data           | TMDb API v3                                  |
| Tests          | Jest + React Testing Library                 |

## Project structure

```
src/
├── components/
│   ├── ErrorMessage.jsx      # Friendly error banner with retry
│   ├── Layout.jsx            # Navbar + page container for signed-in pages
│   ├── Loading.jsx           # Spinner
│   ├── MovieCard.jsx         # Reusable poster card + favorite button
│   ├── MovieDetails.jsx      # Presentational details view (cast, trailer...)
│   ├── MovieFilters.jsx      # Bonus: genre / year / rating filters
│   ├── MovieGrid.jsx         # Responsive grid of MovieCards
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx    # Redirects to /login when signed out
│   ├── SearchBar.jsx
│   ├── ThemeToggle.jsx
│   └── TrendingMovies.jsx
├── context/
│   ├── AuthContext.jsx       # Demo login state
│   └── MovieContext.jsx      # Trending, search/pagination, favorites, theme
├── hooks/
│   └── useInfiniteScroll.js  # IntersectionObserver hook
├── pages/
│   ├── Favorites.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── MovieDetails.jsx      # Fetches details, cast and videos
│   └── NotFound.jsx
├── services/
│   └── tmdbApi.js            # All Axios/TMDb logic + error translation
├── theme/
│   └── theme.js              # MUI light/dark themes
├── utils/
│   ├── localStorage.js       # Safe localStorage wrapper
│   └── movieHelpers.js       # Formatting helpers
├── App.js
├── index.js
└── index.css
```

## TMDb API setup

1. Create a free account at <https://www.themoviedb.org/signup>.
2. Open **Settings → API** (<https://www.themoviedb.org/settings/api>) and request an API key (choose the "Developer" option).
3. Copy the **API Key (v3 auth)** value.

Endpoints used (all through `src/services/tmdbApi.js`):

| Function                   | Endpoint                     |
| -------------------------- | ---------------------------- |
| `getTrendingMovies()`      | `GET /trending/movie/week`   |
| `searchMovies(query, page)`| `GET /search/movie`          |
| `getMovieDetails(id)`      | `GET /movie/{id}`            |
| `getMovieCredits(id)`      | `GET /movie/{id}/credits`    |
| `getMovieVideos(id)`       | `GET /movie/{id}/videos`     |
| `getGenres()` (bonus)      | `GET /genre/movie/list`      |

## Environment variables

Create a `.env` file in the project root (it is git-ignored) using `.env.example` as a template:

```
REACT_APP_TMDB_API_KEY=your_api_key
```

Replace `your_api_key` with your own TMDb v3 API key. **Never commit `.env` or put a real key in the source code or this README.** Restart `npm start` after changing it.

> Note: Create React App embeds `REACT_APP_*` variables into the browser bundle, so a key used in a front-end-only app is visible to anyone who inspects the deployed site. That is normal for TMDb's free, read-only keys, but it is the reason the key must never be committed to the repository.

If the key is missing or invalid the app shows a clear message instead of crashing.

## Installation

```bash
git clone <your-gitlab-repo-url>
cd movie-explorer
npm install
cp .env.example .env     # then edit .env and add your key
```

## Running locally

```bash
npm start
```

Open <http://localhost:3000>. On the login page enter **any** username and password (the assignment only requires a login interface, so this is a front-end demo flow with no backend).

Run the tests:

```bash
npm test
```

## Production build

```bash
npm run build
```

The optimized static site is created in `build/`.

## Implemented features – how they work

- **Infinite scroll:** a sentinel element below the grid is watched by an `IntersectionObserver` (`useInfiniteScroll`). When it becomes visible, `loadMore()` in `MovieContext` requests the next TMDb page. Guards prevent duplicate requests (in-flight flag + a set of requested pages), previous results are kept and de-duplicated by movie id, a spinner shows while loading, loading stops when `page === total_pages`, a failed page shows a retry button (no automatic retry loop) and every new search resets pagination. Responses from an outdated search are ignored.
- **Last search:** the submitted query is saved under `movieExplorer:lastSearch`; on the next visit the search box is pre-filled and the search is re-run. The clear (×) button removes it.
- **Favorites:** stored under `movieExplorer:favorites` as a small snapshot per movie; toggling adds/removes, duplicates are impossible because entries are keyed by movie id.
- **Theme:** MUI `createTheme` for light and dark mode, persisted under `movieExplorer:themeMode`; first visit follows the OS preference.
- **Errors:** the Axios instance translates failures (401, 404, 429, 5xx, network/timeout, missing key) into friendly `ApiError` messages. Missing posters, dates, overview, cast or trailers each have their own fallback.
- **Filters (bonus):** applied to the results loaded so far; the genre list comes from TMDb. Scrolling loads more pages, which are filtered as they arrive.

## Deployment

The project includes `vercel.json` and `public/_redirects` / `netlify.toml` so that direct links such as `/movie/550` or `/favorites` work after deployment (single-page-app rewrites).

### Vercel

1. Push the repository to GitLab (or GitHub/Bitbucket).
2. Go to <https://vercel.com/new> and import the repository.
3. Framework preset: **Create React App** (auto-detected). Build command `npm run build`, output directory `build`.
4. Under **Environment Variables** add `REACT_APP_TMDB_API_KEY` with your TMDb key.
5. Click **Deploy** and copy the live URL into the top of this README.

CLI alternative: `npm i -g vercel && vercel --prod` (add the variable with `vercel env add REACT_APP_TMDB_API_KEY`).

### Netlify

1. Go to <https://app.netlify.com/start> and import the repository.
2. Build command `npm run build`, publish directory `build` (already set in `netlify.toml`).
3. Under **Site configuration → Environment variables** add `REACT_APP_TMDB_API_KEY`.
4. Deploy and copy the live URL into this README.

Because `REACT_APP_*` values are read at **build time**, redeploy after changing the variable.

## GitLab submission

```bash
git init
git add .
git status            # confirm .env and node_modules are NOT listed
git commit -m "Movie Explorer – Loons Lab developer selection test"
git branch -M main
git remote add origin <your-gitlab-repo-url>
git push -u origin main
```

## Credits

This product uses the TMDb API but is not endorsed or certified by TMDb.
