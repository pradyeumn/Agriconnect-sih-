import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgriConnect – Smart Farmer Procurement",
  description:
    "AgriConnect is a smart agricultural procurement and sales management system connecting farmers, buyers, and supply chain administrators.",
  keywords: "agriculture, farmer, procurement, supply chain, India, farm produce",
  openGraph: {
    title: "AgriConnect",
    description: "Smart Farmer Procurement and Sales Management System",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: "10px",
                    background: "#1a1a1a",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                  success: {
                    iconTheme: { primary: "#16a34a", secondary: "#fff" },
                  },
                  error: {
                    iconTheme: { primary: "#ef4444", secondary: "#fff" },
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
