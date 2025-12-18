"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  CheckIcon,
  CrownIcon,
  LogOut,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Protect the page
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !localStorage.getItem("gym_user")) {
        router.push("/login");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  if (!user) {
    return null; // Or a loading spinner
  }

  // Subscription Plans
  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Rp 300.000",
      description: "Mulai perjalanan kebugaran Anda",
      icon: ShieldIcon,
      features: [
        "Akses Gym 08:00 - 20:00",
        "Locker Room Standar",
        "1x Sesi PT Gratis",
        "Akses Aplikasi Basic",
      ],
      current: false,
      color: "text-zinc-400",
      bg: "bg-zinc-900",
      border: "border-zinc-800",
    },
    {
      id: "gold",
      name: "Gold Member",
      price: "Rp 750.000",
      description: "Pilihan paling populer untuk hasil maksimal",
      icon: StarIcon,
      features: [
        "Akses Semua Gym 24 Jam",
        "Locker Room VIP",
        "Pelatih Pribadi 2x/bulan",
        "Minuman Gratis",
        "Akses Kelas Senam",
      ],
      current: true,
      color: "text-amber-400",
      bg: "bg-linear-to-br from-zinc-900 to-amber-950/30",
      border: "border-amber-500/50",
    },
    {
      id: "vip",
      name: "VIP Access",
      price: "Rp 1.500.000",
      description: "Pengalaman eksklusif tanpa batas",
      icon: CrownIcon,
      features: [
        "Akses Prioritas Tanpa Batas",
        "Unlimited Personal Trainer",
        "Akses Spa & Sauna Eksklusif",
        "Laundry Gym Gear",
        "Konsultasi Nutrisi Mingguan",
      ],
      current: false,
      color: "text-purple-400",
      bg: "bg-linear-to-br from-zinc-900 to-purple-950/30",
      border: "border-purple-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Profile Section */}
      <section className="relative pt-32 pb-12 px-4 bg-linear-to-b from-zinc-900 to-background border-b border-border/50">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-lime-600 flex items-center justify-center text-black shadow-2xl ring-4 ring-black/50">
            <span className="text-5xl font-black italic">{user.name.charAt(0).toUpperCase()}</span>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">{user.name}</h1>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-muted-foreground">
              <span className="text-lg">@{user.username}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 rounded-full text-sm">
                <CalendarIcon className="w-3.5 h-3.5" />
                Member
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-zinc-700 hover:bg-zinc-800 text-foreground"
            >
              <SettingsIcon className="w-4 h-4" />
              Edit Profil
            </Button>
            <Button variant="destructive" className="gap-2" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Pilihan Paket Membership</h2>
          <p className="text-muted-foreground max-w-xl">
            Upgrade membership Anda untuk mendapatkan akses lebih banyak fasilitas dan manfaat
            eksklusif.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                plan.bg
              } ${plan.border} ${
                plan.current
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/10"
                  : "border border-zinc-800"
              }`}
            >
              {plan.current && <div className="absolute top-0 inset-x-0 bg-primary h-1" />}

              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-zinc-950/50 ${plan.color}`}>
                    <plan.icon className="w-8 h-8" />
                  </div>
                  {plan.current && (
                    <span className="px-3 py-1 rounded-full bg-primary text-black text-xs font-bold uppercase tracking-wider">
                      Aktif
                    </span>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground font-medium">/bulan</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-4 pt-2">
                  <div className="h-px bg-zinc-800 w-full" />
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <CheckIcon
                        className={`w-5 h-5 shrink-0 ${
                          plan.current ? "text-primary" : "text-zinc-500"
                        }`}
                      />
                      <span className="text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full font-bold ${
                    plan.current
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white cursor-default"
                      : "bg-primary text-black hover:bg-primary/90"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? "Paket Saat Ini" : "Pilih Paket"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
