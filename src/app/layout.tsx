import type { Metadata } from "next";
import "./globals.css";
import { InstallPrompt } from "../components/InstallPrompt";

export const metadata: Metadata = {
  title: "Back-Toll Trip Calculator | PH Toll Fees & Fuel Estimate",
  description: "Back-Toll Trip Calculator: Essential trip planner for Van Hiace rentals, Lalamove/Grab delivery, big bike riders, and trucking services in the Philippines. Accurately estimate NLEX, SCTEX, TPLEX, and SLEX toll fees and real-time fuel costs. Optimize your routes alongside Waze and Google Maps.",
  keywords: ["PH Toll Calculator", "Back-Toll", "NLEX rates 2024", "SCTEX TPLEX fees", "Hiace fuel consumption", "L300 trucking cost", "rental car trip planner", "big bike toll class", "delivery service expense", "trucking services PH", "Waze PH", "Google Maps PH"],
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Back-Toll" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-[#020617] text-slate-100 antialiased selection:bg-blue-500/30">
        {children}
        <InstallPrompt />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful');
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
