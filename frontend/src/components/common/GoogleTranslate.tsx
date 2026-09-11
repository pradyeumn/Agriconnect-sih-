"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    // Check saved language
    const savedLang = localStorage.getItem("agriconnect_google_lang") || "en";
    setCurrentLang(savedLang);

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr,pa,gu,ta,te,kn,ml,bn",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem("agriconnect_google_lang", langCode);

    // Set cookie for google translate
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${langCode}; path=/`;

    // Trigger language switch on google element if loaded
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden google translate container */}
      <div id="google_translate_element" className="hidden" />

      {/* Styled Language Selector Pill Bar */}
      <div className="flex items-center bg-gray-100/90 backdrop-blur p-1 rounded-xl border border-gray-200 text-xs font-bold shadow-inner">
        <button
          onClick={() => changeLanguage("en")}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            currentLang === "en"
              ? "bg-white text-emerald-700 shadow-sm font-extrabold"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>🇬🇧</span> English
        </button>
        <button
          onClick={() => changeLanguage("hi")}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            currentLang === "hi"
              ? "bg-emerald-600 text-white shadow-sm font-extrabold"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>🇮🇳</span> हिंदी
        </button>
        <button
          onClick={() => changeLanguage("mr")}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            currentLang === "mr"
              ? "bg-orange-600 text-white shadow-sm font-extrabold"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>🚩</span> मराठी
        </button>
      </div>
    </div>
  );
}
