# PH Toll & Fuel Calculator PWA

A responsive, mobile-friendly Next.js Progressive Web App (PWA) for estimating total travel costs (toll fees + diesel fuel) for road trips in the Philippines.

## Features
- 🛣️ Calculates distance using a heuristic/simulated routing layer.
- ⛽ Estimates fuel costs based on customizable distance, vehicle efficiency, and diesel prices.
- 💳 Calculates toll fees for common segments (NLEX, SCTEX, TPLEX) automatically on matching routes.
- 🌐 Fully usable offline as a PWA (can be installed to your mobile home screen).
- 💾 Persists your recent routes, preferred diesel price, and van profile locally in `localStorage`.
- 📊 Cost breakdown with optional contingency buffers.

## Setup Instructions

Ensure you have Node.js installed.
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
npm start
```

---

## How to Manually Update Toll Fees and Diesel Defaults

Because this app uses a static data file for extreme reliability and avoiding unnecessary database/server overhead, you can easily update the core prices whenever values change holding local data. 

To update the values, open the file located at:
`src/config/data.ts`

### Updating Diesel Default Price
Locate the `DEFAULT_DIESEL_PRICE` variable at the top of the file:
```ts
export const DEFAULT_DIESEL_PRICE = 58.50; // PHP per liter
```
Change `58.50` to the new pump price. Wait for your deployment/build to refresh to see the new default. Note: Users with existing `localStorage` preferences will still see their last manually entered price overriding this, but the default fallback is updated!

### Updating Toll Rates
Locate the `TOLL_RATES` array. Each entry looks like this:
```ts
{
  id: "nlex-balintawak-marilao",
  name: "Balintawak to Marilao",
  expressway: "NLEX",
  rates: {
    "Class 1": 74,
    "Class 2": 186,
    "Class 3": 223
  }
}
```
Simply edit the numbers `74`, `186`, etc., to the newly announced toll prices. Save the file and rebuild the app.

### Updating the "Last Updated" Meta Dates
To let users (or yourself) know how fresh the data is, update `CONFIG_META`:
```ts
export const CONFIG_META = {
  DIESEL_LAST_UPDATED: "2024-05-15",
  TOLLS_LAST_UPDATED: "2024-05-15",
};
```

## Running Tests
Basic test calculations are implemented in `src/utils/calculator.test.ts` as pure node assert commands. Execute them to verify functionality if you radically alter the calculator logic:
```bash
npx ts-node src/utils/calculator.test.ts
```

## Future Extensibility
This codebase is structured with clear Service boundaries (`src/services/tolls.ts`, `src/services/routing.ts`). To upgrade to V2 with live integration:
1. Map `src/services/routing.ts` to Mapbox and OSRM (or Google Maps).
2. Rewrite `src/config/data.ts` exports to be dynamic `fetch` calls to a Database or scraping microservice.
