"use client";

import { useEffect, useState, useCallback } from "react";

type OSType = "android" | "ios" | "desktop";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const detectOS = (): OSType => {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  return "desktop";
};

const isInStandaloneMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

export function InstallPrompt() {
  const [os, setOs] = useState<OSType>("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const detected = detectOS();
    setOs(detected);

    // Don't show if already installed as PWA
    if (isInStandaloneMode()) return;
    if (localStorage.getItem("backtoll-install-dismissed") === "true") return;

    // For Android: listen for beforeinstallprompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    // For iOS: always show since no native prompt available
    if (detected === "ios") {
      setShowButton(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Listen for app install to hide button
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowButton(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  // Pulsing tooltip every 10 seconds
  useEffect(() => {
    if (!showButton || installed) return;

    // Show tooltip after 2 seconds initially
    const initial = setTimeout(() => setShowTooltip(true), 2000);

    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 4000);
    }, 10000);

    // Hide first tooltip after 4 seconds
    const hideFirst = setTimeout(() => setShowTooltip(false), 6000);

    return () => {
      clearTimeout(initial);
      clearTimeout(hideFirst);
      clearInterval(interval);
    };
  }, [showButton, installed]);

  const handleInstall = useCallback(async () => {
    if (os === "android" && deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShowButton(false);
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (os === "ios") {
      setShowIOSModal(true);
    }
  }, [os, deferredPrompt]);

  const handleDismiss = () => {
    setShowButton(false);
    localStorage.setItem("backtoll-install-dismissed", "true");
  };

  if (!showButton || installed) return null;

  const isAndroid = os === "android";
  const isIOS = os === "ios";

  // Only display for mobile devices
  if (!isAndroid && !isIOS) return null;

  return (
    <>
      {/* Floating Install Button */}
      <div className="fixed bottom-6 right-5 z-[99999] flex flex-col items-end gap-2">
        {/* Tooltip */}
        <div
          className={`transition-all duration-500 ${
            showTooltip
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          <div className="relative bg-slate-900 border border-blue-500/40 text-white text-[11px] font-black px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] max-w-[190px] text-center uppercase tracking-widest leading-snug">
            <div className="text-blue-400 text-[9px] mb-1">
              {isAndroid ? "📱 Android" : "🍎 iOS"}
            </div>
            Install for quick access!
            {/* Arrow pointing down-right */}
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-slate-900 border-r border-b border-blue-500/40 rotate-45" />
          </div>
        </div>

        <div className="flex items-end gap-2">
          {/* Dismiss X — tiny */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 mb-1 rounded-full bg-slate-800 border border-slate-700 text-slate-500 hover:text-white text-[9px] flex items-center justify-center transition-all"
            title="Dismiss"
          >
            ✕
          </button>

          {/* Round Icon Button */}
          <button
            onClick={handleInstall}
            title={isAndroid ? "Install on Android" : "Install on iOS"}
            className="relative w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.7)] border-2 border-blue-400/50 transition-all active:scale-95 animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
            {/* Icon */}
            <span className="text-2xl leading-none relative z-10">
              {isAndroid ? "🤖" : "🍎"}
            </span>
          </button>
        </div>
      </div>

      {/* iOS Install Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
          />
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-500 space-y-5">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">iOS Install Guide</div>
                <h3 className="font-black text-white text-lg tracking-tighter">Add to Home Screen</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {[
                { step: "1", icon: "🌐", text: "Open this page in Safari (not Chrome/Firefox)" },
                { step: "2", icon: "📤", text: 'Tap the Share icon at the bottom of Safari' },
                { step: "3", icon: "➕", text: 'Scroll down and tap "Add to Home Screen"' },
                { step: "4", icon: "✅", text: 'Tap "Add" — Back-Toll will appear on your home screen!' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shrink-0">
                    {item.step}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-slate-300 text-xs font-bold leading-tight">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual hint for share icon */}
            <div className="flex items-center justify-center gap-2 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
              <span className="text-2xl">📤</span>
              <span className="text-blue-300 text-xs font-black uppercase tracking-widest">Tap the Share icon in Safari's toolbar</span>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
