"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, Utensils, MessageCircle, Home, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/list-latihan", label: "List Latihan", icon: Dumbbell },
    { href: "/cek-nutrisi", label: "Cek Nutrisi", icon: Utensils },
    { href: "/room-chat", label: "Room Chat", icon: MessageCircle },
  ];

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="w-full grid grid-cols-3 h-16 items-center px-8 md:px-12">
        {/* Left: Logo */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden md:inline-block">UNP Gym</span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex items-center justify-center">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md hover:bg-accent/50",
                pathname === href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Auth Buttons */}
        <div className="flex items-center justify-end gap-4">
          {user ? (
            <Button asChild variant="ghost" size="icon" className="rounded-full" title="Profil">
              <Link href="/profil">
                <User className="h-5 w-5" />
                <span className="sr-only">Profil</span>
              </Link>
            </Button>
          ) : (
            <Button asChild className="bg-primary text-black hover:bg-primary/90 font-bold">
              <Link href="/login">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
