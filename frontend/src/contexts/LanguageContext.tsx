"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "hi";

export interface Translations {
  // Nav
  brandName: string;
  signIn: string;
  getStarted: string;
  farmerPortal: string;
  buyerPortal: string;
  adminPortal: string;
  languageName: string;
  switchLangLabel: string;

  // Hero Section
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  startFreeToday: string;
  viewDashboard: string;

  // Stats Section
  activeFarmers: string;
  procurementValue: string;
  collectionCenters: string;
  statesCovered: string;

  // Features Section
  featuresTitle: string;
  featuresSubtitle: string;
  f1Title: string;
  f1Desc: string;
  f2Title: string;
  f2Desc: string;
  f3Title: string;
  f3Desc: string;
  f4Title: string;
  f4Desc: string;
  f5Title: string;
  f5Desc: string;
  f6Title: string;
  f6Desc: string;

  // Roles Section
  rolesTitle: string;
  farmerRoleTitle: string;
  farmerF1: string;
  farmerF2: string;
  farmerF3: string;
  farmerF4: string;
  farmerCta: string;

  buyerRoleTitle: string;
  buyerF1: string;
  buyerF2: string;
  buyerF3: string;
  buyerF4: string;
  buyerCta: string;

  adminRoleTitle: string;
  adminF1: string;
  adminF2: string;
  adminF3: string;
  adminF4: string;
  adminCta: string;

  // Footer
  footerText: string;
}

const translations: Record<Language, Translations> = {
  en: {
    brandName: "AgriConnect",
    signIn: "Sign In",
    getStarted: "Get Started",
    farmerPortal: "Farmer Portal",
    buyerPortal: "Buyer Marketplace",
    adminPortal: "Admin Center",
    languageName: "English",
    switchLangLabel: "🌐 हिंदी में बदलें (Hindi)",

    heroBadge: "Smart Agricultural Supply Chain",
    heroTitle1: "Connecting Farmers to",
    heroTitle2: "Better Markets",
    heroSubtitle:
      "AgriConnect uses AI-powered smart allocation to match farmers with procurement opportunities, eliminate middlemen, and get fair prices for every harvest.",
    startFreeToday: "Start Free Today",
    viewDashboard: "View Dashboard",

    activeFarmers: "Active Farmers",
    procurementValue: "Procurement Value",
    collectionCenters: "Collection Centers",
    statesCovered: "States Covered",

    featuresTitle: "Everything you need to succeed",
    featuresSubtitle: "One platform for farmers, buyers, and administrators",
    f1Title: "Farmer Dashboard",
    f1Desc: "Manage inventory, track orders, confirm procurement slots with a simple mobile-first interface.",
    f2Title: "Marketplace",
    f2Desc: "Buyers can discover nearby farmers, filter by crop, grade, and price, and place orders instantly.",
    f3Title: "Location Intelligence",
    f3Desc: "Live maps showing farmers, buyers, and collection centers with distance-based filtering.",
    f4Title: "Smart Allocation",
    f4Desc: "AI-powered matching ranks farmers by distance, inventory, availability, and reliability score.",
    f5Title: "Analytics & Reports",
    f5Desc: "Real-time charts for crop-wise demand, location-wise supply, and monthly sales trends.",
    f6Title: "Inventory Safety",
    f6Desc: "Database-level transactions prevent overselling. Quantities are always accurate and consistent.",

    rolesTitle: "Built for everyone in the supply chain",
    farmerRoleTitle: "Farmer (किसान)",
    farmerF1: "Register with GPS location",
    farmerF2: "Add crop inventory stacks",
    farmerF3: "Accept/reject buyer orders",
    farmerF4: "Confirm procurement slots",
    farmerCta: "Get Started as Farmer",

    buyerRoleTitle: "Wholesale Buyer",
    buyerF1: "Browse nearby fresh produce",
    buyerF2: "Filter by grade & price",
    buyerF3: "Instant buyout & checkout",
    buyerF4: "Track order dispatch status",
    buyerCta: "Get Started as Buyer",

    adminRoleTitle: "Government Admin",
    adminF1: "Manage all platform users",
    adminF2: "Create procurement plans",
    adminF3: "Run smart farmer allocation",
    adminF4: "View spatial analytics & maps",
    adminCta: "Sign In as Admin",

    footerText: "© 2026 AgriConnect. Smart Farmer Procurement and Sales Management System.",
  },
  hi: {
    brandName: "एग्रीकनेक्ट (AgriConnect)",
    signIn: "लॉग इन करें (Sign In)",
    getStarted: "शुरू करें (Get Started)",
    farmerPortal: "किसान पोर्टल (Farmer Portal)",
    buyerPortal: "खरीदार बाज़ार (Marketplace)",
    adminPortal: "प्रशासक केंद्र (Admin Center)",
    languageName: "हिंदी (Hindi)",
    switchLangLabel: "🌐 Switch to English",

    heroBadge: "स्मार्ट कृषि आपूर्ति श्रृंखला (Smart Agri Chain)",
    heroTitle1: "किसानों को सीधे जोड़ें",
    heroTitle2: "सर्वश्रेष्ठ बाज़ार से",
    heroSubtitle:
      "एग्रीकनेक्ट एआई-संचालित स्मार्ट आवंटन तकनीक का उपयोग करके किसानों को निकटतम खरीद केंद्रों और थोक खरीदारों से सीधे जोड़ता है, बिचौलियों को समाप्त करता है और हर फसल का उचित मूल्य दिलाता है।",
    startFreeToday: "आज ही मुफ़्त पंजीकरण करें",
    viewDashboard: "डैशबोर्ड देखें",

    activeFarmers: "सक्रिय किसान",
    procurementValue: "कुल खरीद मूल्य",
    collectionCenters: "संगलन केंद्र",
    statesCovered: "शामिल राज्य",

    featuresTitle: "आपकी सफलता के लिए सभी सुविधाएं",
    featuresSubtitle: "किसानों, खरीदारों और प्रशासकों के लिए एक एकीकृत मंच",
    f1Title: "किसान डैशबोर्ड",
    f1Desc: "फसल स्टॉक अपलोड करें, ऑर्डर ट्रैक करें, और आसान मोबाइल इंटरफेस के साथ स्लोट बुकिंग की पुष्टि करें।",
    f2Title: "फसल बाज़ार (Marketplace)",
    f2Desc: "थोक खरीदार निकटतम किसानों से सीधे संपर्क कर सकते हैं, फसल की गुणवत्ता और मूल्य के अनुसार तुरंत खरीदारी कर सकते हैं।",
    f3Title: "जीपीएस और लोकेशन मैप",
    f3Desc: "किसानों, खरीदारों और संकलन केंद्रों की दूरी और सटीक जीपीएस स्थान दिखाने वाला लाइव नक्शा।",
    f4Title: "स्मार्ट किसान आवंटन इंजन",
    f4Desc: "एआई एल्गोरिदम दूरी, फसल मात्रा, उपलब्धता और किसान विश्वसनीयता रेटिंग के आधार पर निष्पक्ष आवंटन करता है।",
    f5Title: "विश्लेषण और रिपोर्ट",
    f5Desc: "मांग, आपूर्ति और मासिक बिक्री के लाइव चार्ट और आंकड़े।",
    f6Title: "सुरक्षित स्टॉक प्रबंधन",
    f6Desc: "रियल-टाइम डेटाबेस अपडेट से ओवरसेलिंग रुकती है और स्टॉक मात्रा हमेशा सटीक रहती है।",

    rolesTitle: "कृषि आपूर्ति श्रृंखला के हर सदस्य के लिए निर्मित",
    farmerRoleTitle: "किसान (Farmer)",
    farmerF1: "जीपीएस लोकेशन के साथ पंजीकरण करें",
    farmerF2: "अपनी फसल का नया स्टॉक जोड़ें",
    farmerF3: "खरीदार ऑर्डर्स को स्वीकार / अस्वीकार करें",
    farmerF4: "सरकारी खरीद स्लोट की पुष्टि करें",
    farmerCta: "किसान के रूप में पंजीकरण करें",

    buyerRoleTitle: "थोक खरीदार (Buyer)",
    buyerF1: "निकटतम ताज़ा उपज खोजें",
    buyerF2: "ग्रेड और कीमत के अनुसार फ़िल्टर करें",
    buyerF3: "तुरंत खरीदारी और चेकआउट",
    buyerF4: "डिलीवरी स्थिति ट्रैक करें",
    buyerCta: "खरीदार के रूप में पंजीकरण करें",

    adminRoleTitle: "सरकारी प्रशासक (Admin)",
    adminF1: "सभी उपयोगकर्ताओं का प्रबंधन करें",
    adminF2: "खरीद योजनाएं और स्लोट्स बनाएं",
    adminF3: "स्मार्ट आवंटन एल्गोरिदम चलाएं",
    adminF4: "नक्शा और विश्लेषण देखें",
    adminCta: "एडमिन के रूप में लॉग इन करें",

    footerText: "© 2026 एग्रीकनेक्ट। स्मार्ट किसान खरीद और फसल बिक्री प्रबंधन प्रणाली।",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("agriconnect_lang") as Language;
    if (saved === "en" || saved === "hi") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("agriconnect_lang", lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
