import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PH Toll & Fuel Calculator",
  description: "Estimate your toll fees and diesel fuel cost for road trips in the Philippines.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0f172a", // Tailwind slate-900
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
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
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
