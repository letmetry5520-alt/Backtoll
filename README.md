# Back-Toll Trip Calculator 🛣️⛽

A modern, mobile-responsive web application designed for Philippine road trips. Estimate toll fees (NLEX, SCTEX, TPLEX, SLEX) and fuel costs with high accuracy, featuring smart address autocomplete and map pinning.

## 🎯 Targeted Audience
Optimized for the following high-utility groups:
- **Transport Services**: Van rentals (Hiace/Urvan), Car rentals, and Trucking services.
- **Logistics & Delivery**: Lalamove, Grab, and independent 4-wheel/6-wheel delivery drivers.
- **Navigation Users**: Waze and Google Maps power-users who need secondary cost validation.
- **Enthusiasts**: Big bike riders (Class 1) and road trip planners.

## 🚀 SEO & Marketplace Strategy

### SEO Metadata
- **Title**: `Back-Toll Trip Calculator | PH Toll Fees & Fuel Estimate`
- **Keywords**: `PH Toll Calculator`, `Back-Toll`, `NLEX rates 2024`, `SCTEX TPLEX fees`, `Hiace fuel consumption`, `L300 trucking cost`, `rental car trip planner`, `big bike toll class`, `delivery service expense`, `trucking services PH`, `Waze PH`, `Google Maps PH`.
- **Description**: Essential trip planner for Van Hiace rentals, Lalamove/Grab delivery, big bike riders, and trucking services in the Philippines. Accurately estimate NLEX, SCTEX, TPLEX, and SLEX toll fees.

### SEO Implementation Checklist
- [x] **Lightweight Performance**: Built with Next.js 14 for fast TTI (Time to Interactive).
- [x] **Semantic HTML**: Proper use of `h1`, `label`, and `main` tags for search engine crawling.
- [x] **Meta Tags**: Optimized `<title>` and `<meta description>` in `layout.tsx`.
- [x] **Mobile-First Design**: Responsive UI for drivers on the go (Waze/Google Maps users).
- [x] **Custom Icons**: SVG-based icons (Lucide) for zero-weight visual assets.

## 🚀 Features

- **Smart Address Autocomplete**: Real-time Philippine place suggestions using Nominatim (OpenStreetMap).
- **Interactive Map Picker**: Drop a pin anywhere in the Philippines to set your origin or destination.
- **Dynamic Toll Matrix**: 
  - Supports **Class 1, 2, and 3** vehicles.
  - Covers **NLEX, SCTEX, and TPLEX** with up-to-date rates.
  - **Local-Aware Routing**: Residents of Bulacan/Marilao get optimized "Nearest Exit" suggestions (e.g., skips Balintawak segment automatically).
- **Premium Dark UI**: 
  - Sleek Charcoal/Slate palette with vibrant blue accents.
  - Glassmorphic modal designs for a "Pro" feel.
  - Visual Route Breadcrumbs.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.org/) + [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Geocoding**: [Nominatim API](https://nominatim.org/) (Proxy via Next.js API Routes)
- **Language**: TypeScript

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
