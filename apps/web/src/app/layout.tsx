import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";
import { Navbar } from "@/components/Navbar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Tourism Chain Nepal | Solana-Powered Ecosystem",
  description: "Tokenized tourism rails protocol for the Himalayan experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-dm-sans bg-summit-white">
        <SolanaProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
        </SolanaProvider>
      </body>
    </html>
  );
}
