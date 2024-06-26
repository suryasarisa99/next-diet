import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./index.scss";
import "./y.scss";

import { DataProvider } from "@/context/DataContext";
import { UpdateProvider } from "@/context/UpdateContext";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <style>
        <meta name="theme-color" content="#000000" />
      </style>
      <DataProvider>
        <UpdateProvider>
          <body className={inter.className}>
            {children}
            <div id="overlay" className="hidden"></div>
          </body>
        </UpdateProvider>
      </DataProvider>
    </html>
  );
}
