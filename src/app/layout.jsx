import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "../../providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "PrimeChat",
  description: "Premium real-time communication platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PrimeChat",
  },
};


export const viewport = {
  themeColor: "#032539",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
       
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
