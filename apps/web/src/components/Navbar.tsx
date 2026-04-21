"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Map, LayoutDashboard, Award, Landmark, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const navigation = [
  { name: "Explore", href: "/explore", icon: Map },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vibe", href: "/vibe", icon: Award },
  { name: "DAO", href: "/dao", icon: Landmark },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-himalayan-blue/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-trekker-orange rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <Compass className="text-white w-6 h-6" />
          </div>
          <span className="font-playfair text-2xl text-summit-white hidden md:block tracking-tight">
            Tourism Chain <span className="text-trekker-orange">Nepal</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "text-trekker-orange" 
                    : "text-summit-white/70 hover:text-summit-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <WalletMultiButton className="!bg-trekker-orange !rounded-full !h-10 !px-6 !text-sm !font-bold hover:!opacity-90 transition-opacity" />
        </div>
      </div>
    </nav>
  );
};
