import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Estately | Modern Real Estate Search",
    template: "%s | Estately",
  },
  description: "A modern real estate platform for browsing and saving property listings.",
  keywords: ['real estate', 'homes for sale', 'rentals', 'apartments', 'villas', 'land'],
  openGraph: {
    title: 'Estately | Find homes for sale and rent',
    description: 'Browse homes, apartments, villas and land listings for sale or rent.',
    siteName: 'Estately',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estately | Find homes for sale and rent',
    description: 'Browse homes, apartments, villas and land listings for sale or rent.',
  },
  icons: {
    icon: [
      {
        rel: "icon",
        url: "/branding/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/branding/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-cream-50 text-charcoal-950">
        <Header user={user} />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
