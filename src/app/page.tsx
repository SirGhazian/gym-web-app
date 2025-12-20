"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckIcon,
  CrownIcon,
  DumbbellIcon,
  ShieldIcon,
  StarIcon,
  UsersIcon,
  UtensilsIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const aksiHero = () => {
    if (loading) return;
    if (user) {
      router.push("/profil");
    } else {
      // Scroll ke bagian membership
      const membershipSection = document.getElementById("membership");
      if (membershipSection) {
        membershipSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const pilihPaket = (planId: string) => {
    if (loading) return;
    if (user) {
      // Jika sudah login, pergi ke profil untuk mengelola paket
      router.push("/profil");
    } else {
      // Jika belum login, pergi ke daftar dengan paket terpilih
      router.push(`/register?plan=${planId}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Bagian Hero */}
      <section className="relative w-full min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
        {/* Gambar Latar Belakang */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/background_beranda.jpg"
            alt="Gym Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />{" "}
          {/* Overlay gelap untuk keterbacaan teks */}
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
        </div>

        <div className="container px-4 mx-auto relative z-10 flex flex-col items-center justify-center h-full text-center">
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white drop-shadow-lg">
              BENTUK VERSI <br />
              <span className="text-primary">TERBAIK DIRIMU!</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Buka potensi Anda dengan latihan terkurasi, pelacakan nutrisi
              presisi, dan komunitas yang mendukung Anda.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="bg-primary text-black hover:bg-[oklch(0.8972_0.1786_126.67)] rounded-full px-8 py-6 text-lg font-black italic tracking-wider shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:scale-105 transition-transform cursor-pointer"
                onClick={aksiHero}
              >
                {user ? "LIHAT PROFIL" : "DAFTAR SEKARANG"}
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-full px-8 py-6 text-lg font-black italic tracking-wider border border-zinc-700 hover:scale-105 transition-transform hover:text-white"
              >
                <Link href="/list-latihan">LIHAT LATIHAN</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-background">
        <div className="container px-8 md:px-30 mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground mb-4">
              Segala yang Anda Butuhkan untuk{" "}
              <span className="text-primary">Sukses</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Kami menyediakan alat, panduan, dan dukungan komunitas untuk
              membantu Anda mencapai tujuan kebugaran lebih cepat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-zinc-900">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <DumbbellIcon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Latihan dari Ahli</CardTitle>
                <CardDescription>
                  Akses ratusan rencana latihan yang dirancang secara
                  profesional untuk setiap tingkat kebugaran.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-zinc-900">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <UtensilsIcon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Nutrisi Cerdas</CardTitle>
                <CardDescription>
                  Lacak makro, kalori, dan dapatkan ide persiapan makanan yang
                  dipersonalisasi untuk tubuh Anda.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-zinc-900">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Komunitas Berkembang</CardTitle>
                <CardDescription>
                  Bergabunglah di room, mengobrol dengan rekan, dan bagikan
                  kemajuan Anda di lingkungan yang mendukung.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-24 bg-secondary/30">
        <div className="container px-8 md:px-30 mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">
              Mengapa <span className="text-primary">UNP Gym</span>?
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Kami percaya kebugaran tidak harus rumit. Itulah sebabnya kami
              membangun platform yang menggabungkan panduan profesional dengan
              alat yang mudah digunakan. Apakah Anda seorang pemula atau atlet
              yang ingin memecahkan rekor, kami memiliki sesuatu untuk Anda.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <span className="text-foreground font-medium">
                  Pelacakan Kemajuan Personal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <span className="text-foreground font-medium">
                  Tantangan & Acara Komunitas
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <span className="text-foreground font-medium">
                  Database Nutrisi Terverifikasi
                </span>
              </li>
            </ul>
            <div className="pt-6">
              <Button asChild size="lg" variant="default" className="shadow-lg">
                <Link href={user ? "/profil" : "/register"}>
                  {user ? "Lihat Profil Anda" : "Buat Profil Anda"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Visual Placeholder */}
          <div className="flex-1 w-full flex justify-center">
            <img
              src="/images/whygym.png"
              alt="Why UNP Gym"
              className="[mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
            />
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="relative z-10 py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground">
              Pilih <span className="text-primary">Paket</span> Anda
            </h2>
            <p className="text-muted-foreground text-md">
              Mulai perjalanan kebugaran Anda dengan paket yang fleksibel dan
              sesuai kebutuhan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <Card className="flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border bg-zinc-900 border-zinc-600">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-zinc-950/50 text-zinc-400">
                    <ShieldIcon className="w-8 h-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Basic</CardTitle>
                <p className="text-sm text-muted-foreground mt-2 min-h-[48px]">
                  Mulai perjalanan kebugaran Anda dengan akses esensial.
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-black">Rp 300.000</span>
                  <span className="text-muted-foreground font-medium">
                    /bulan
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4 pt-2">
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">
                      Akses Gym 08:00 - 20:00
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">Locker Room Standar</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">1x Sesi PT Gratis</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">Akses Aplikasi Basic</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full font-bold h-12 text-lg bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white cursor-pointer"
                  onClick={() => pilihPaket("basic")}
                >
                  Pilih Paket
                </Button>
              </CardFooter>
            </Card>

            {/* Gold Plan */}
            <Card className="flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border bg-linear-to-br from-zinc-900 to-amber-950/30 border-amber-500/50 relative shadow-xl shadow-amber-900/10">
              <div className="absolute top-0 right-0 left-0 flex justify-center -mt-3">
                <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Paling Populer
                </span>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-zinc-950/50 text-amber-400">
                    <StarIcon className="w-8 h-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  Gold Member
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2 min-h-[48px]">
                  Pilihan paling populer untuk hasil maksimal dan fleksibilitas.
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-black">Rp 750.000</span>
                  <span className="text-muted-foreground font-medium">
                    /bulan
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4 pt-2">
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="text-zinc-300">
                      Akses Semua Gym 24 Jam
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="text-zinc-300">Locker Room VIP</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="text-zinc-300">
                      Pelatih Pribadi 2x/bulan
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="text-zinc-300">Minuman Gratis</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="text-zinc-300">Akses Kelas Senam</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full font-bold h-12 text-lg bg-primary text-black hover:bg-primary/90 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => pilihPaket("gold")}
                >
                  Pilih Paket
                </Button>
              </CardFooter>
            </Card>

            {/* VIP Plan */}
            <Card className="flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border bg-linear-to-br from-zinc-900 to-purple-950/30 border-purple-500/50">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-zinc-950/50 text-purple-400">
                    <CrownIcon className="w-8 h-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">VIP Access</CardTitle>
                <p className="text-sm text-muted-foreground mt-2 min-h-[48px]">
                  Pengalaman eksklusif tanpa batas untuk gaya hidup premium.
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-black">Rp 1.500.000</span>
                  <span className="text-muted-foreground font-medium">
                    /bulan
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4 pt-2">
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">
                      Akses Prioritas Tanpa Batas
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">
                      Unlimited Personal Trainer
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">
                      Akses Spa & Sauna Eksklusif
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">Laundry Gym Gear</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <CheckIcon className="w-5 h-5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">
                      Konsultasi Nutrisi Mingguan
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full font-bold h-12 text-lg bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white cursor-pointer"
                  onClick={() => pilihPaket("vip")}
                >
                  Pilih Paket
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Decorative Elements - Dark Mode Friendly */}
      {/* <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-lime-600/10 rounded-full blur-[120px] pointer-events-none" /> */}
      {/* <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-zinc-600/10 rounded-full blur-[120px] pointer-events-none" /> */}

      {/* Footer */}
      <footer className="relative z-10 py-6 bg-background border-t border-border">
        <div className="container px-8 md:px-6 mx-auto text-center text-sm text-muted-foreground">
          © 2025 UNPGYM. Dibuat oleh Ghazian dan Ridho.
        </div>
      </footer>
    </div>
  );
}
