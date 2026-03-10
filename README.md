# PH Toll & Fuel Calculator 🛣️⛽

A modern, mobile-responsive web application designed for Philippine road trips. Estimate toll fees (NLEX, SCTEX, TPLEX) and fuel costs with high accuracy, featuring smart address autocomplete and map pinning.

## 🚀 Features

- **Smart Address Autocomplete**: Real-time Philippine place suggestions using Nominatim (OpenStreetMap).
- **Interactive Map Picker**: Drop a pin anywhere in the Philippines to set your origin or destination.
- **Dynamic Toll Matrix**: 
  - Supports **Class 1, 2, and 3** vehicles.
  - Covers **NLEX, SCTEX, and TPLEX** with up-to-date rates.
  - **Local-Aware Routing**: Residents of Bulacan/Marilao get optimized "Nearest Exit" suggestions (e.g., skips Balintawak segment automatically).
- **Comprehensive Estimates**:
  - Distance-based fuel calculation.
  - Round-trip support (doubles tolls and distance).
  - Customizable Efficiency (km/L) and Fuel Price.
  - 10% (or custom) Contingency Buffer for snacks and traffic.
- **Premium UI**: 
  - Dark-mode inspired results with vibrant blue accents.
  - Glassmorphic modal designs (fully opaque for clarity).
  - Visual Route Breadcrumbs (Origin ➔ Destination).

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.org/) + [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Geocoding**: [Nominatim API](https://nominatim.org/) (Proxy via Next.js API Routes)
- **Language**: TypeScript

## 📂 Project Structure

```text
src/
├── app/
│   ├── api/geocode/      # Backend proxy for Nominatim (prevents CORS & rate-limiting)
│   ├── page.tsx          # Main Application Shell
│   └── globals.css       # Design System & Tailwind base
├── components/
│   ├── MapPicker.tsx     # Leaflet Map Modal & Search
│   ├── CalculatorForm.tsx# Main Input Engine & Toll Logic
│   └── ResultsDisplay.tsx# Final Cost Breakdown Modal
├── config/
│   └── data.ts           # Centralized Toll Rates & Fuel Prices
├── services/
│   ├── geocoding.ts      # Fetch logic for addresses
│   └── routing.ts        # Smart Distance Heuristic Library
└── utils/
    └── calculator.ts     # Pure math for fuel, tolls, and totals
```

## 📝 How to Use & Customize

### Adding New Tolls
Modify `src/config/data.ts`. Add a new entry to the `TOLL_RATES` array:
```typescript
{
  id: "mcx-daang-hari",
  name: "Daang Hari to SLEX",
  expressway: "MCX",
  rates: { "Class 1": 17, "Class 2": 35, "Class 3": 52 }
}
```

### Updating Fuel Prices
The default prices are set in `src/config/data.ts` under `DEFAULT_DIESEL_PRICE` and `DEFAULT_UNLEADED_PRICE`.

## 🏗️ Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Locally**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📜 License
This project is built for the Philippine community. Drive safe! 🇵🇭
