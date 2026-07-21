# CSGOSkinAlbum

A small full-stack app for browsing and favoriting CS:GO skin collections.

## Structure

- Frontend: [csgoapp](csgoapp)
- Backend: [server](server)

## Run locally

1. Install dependencies in both apps:
   - `npm --prefix csgoapp install`
   - `npm --prefix server install`
2. Start the backend:
   - `npm --prefix server run dev`
3. Start the frontend:
   - `npm --prefix csgoapp start`

## Notes

- The frontend uses React with Create React App.
- The server is a lightweight Express API.
- Environment variables are expected in the app-level `.env` files.
