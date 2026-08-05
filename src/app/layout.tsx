import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import PlausibleProvider from "next-plausible";

// All pages inherit edge runtime for Cloudflare Pages deployment
export const runtime = "edge";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreeSureOdd - AI Football Predictions & Analysis",
  description:
    "Get the most accurate football predictions with 85%+ success rate. AI-powered match analysis covering Premier League, La Liga, Champions League and 15+ major leagues. Join thousands of winning football fans.",
  icons: {
    icon: [
      {
        url: "/icons/icons8-football-pastel-color-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icons/icons8-football-pastel-color-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/icons8-football-pastel-color-96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/icons8-football-pastel-color-76.png",
        sizes: "76x76",
        type: "image/png",
      },
      {
        url: "/icons/icons8-football-pastel-color-72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/icons/icons8-football-pastel-color-60.png",
        sizes: "60x60",
        type: "image/png",
      },
      {
        url: "/icons/icons8-football-pastel-color-57.png",
        sizes: "57x57",
        type: "image/png",
      },
    ],
    other: [
      {
        url: "/icons/icons8-football-pastel-color-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/icons/icons8-football-pastel-color-70.png",
        sizes: "70x70",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=yes"
        />
      </head>
      <PlausibleProvider
        domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || ""}
      >
        <body className={inter.className}>
          <Providers>
            <Header />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </Providers>
          <Analytics />
        </body>
      </PlausibleProvider>
    </html>
  );
}
