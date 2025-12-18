"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Dumbbell } from "lucide-react";
import { getLatihan, Latihan } from "../actions/exercise";
import Link from "next/link";

// Daftar bagian tubuh untuk filter
const DAFTAR_BAGIAN_TUBUH = [
  "All",
  "Back",
  "Calves",
  "Chest",
  "Forearms",
  "Hips",
  "Neck",
  "Shoulders",
  "Thighs",
  "Waist",
  "Hands",
  "Feet",
  "Face",
  "Full Body",
  "Biceps",
  "Upper Arms",
  "Triceps",
  "Hamstrings",
  "Quadriceps",
  "Cardio",
];

export default function HalamanListLatihan() {
  const [pencarian, setPencarian] = React.useState("");
  const [bagianTubuh, setBagianTubuh] = React.useState("All");

  const [daftarLatihan, setDaftarLatihan] = React.useState<Latihan[] | null>(null);
  const [memuat, setMemuat] = React.useState(false);
  const [kesalahan, setKesalahan] = React.useState<string | null>(null);

  // Fetch awal saat mount
  React.useEffect(() => {
    handlePencarian();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePencarian = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMemuat(true);
    setKesalahan(null);
    setDaftarLatihan(null);

    try {
      const respon = await getLatihan(pencarian, bagianTubuh);

      if (respon.error) {
        setKesalahan(respon.error);
      } else if (respon.data) {
        setDaftarLatihan(respon.data);
      }
    } catch (err) {
      setKesalahan("Terjadi kesalahan saat mengambil data latihan.");
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100svh-65px)] flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">
            List <span className="text-primary">Latihan</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Temukan latihan yang tepat untuk target otot Anda. Gunakan pencarian dan filter di bawah
            ini.
          </p>
        </div>

        {/* Bar Pencarian & Filter */}
        <Card className="border-border/50 bg-zinc-900 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handlePencarian} className="grid md:grid-cols-12 gap-4 items-end">
              {/* Input Pencarian */}
              <div className="md:col-span-6">
                <Label htmlFor="search" className="mb-3 block">
                  Cari Latihan
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Contoh: Bench Press, Squat..."
                    value={pencarian}
                    onChange={(e) => setPencarian(e.target.value)}
                    className="pl-9 bg-background/50 h-10"
                  />
                </div>
              </div>

              {/* Filter Bagian Tubuh */}
              <div className="md:col-span-3">
                <Label className="mb-3 block">Target Otot</Label>
                <Select value={bagianTubuh} onValueChange={setBagianTubuh}>
                  <SelectTrigger className="bg-background/50 w-full h-10">
                    <SelectValue placeholder="Pilih Otot" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAFTAR_BAGIAN_TUBUH.map((bagian) => (
                      <SelectItem key={bagian} value={bagian}>
                        {bagian}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tombol Cari */}
              <div className="md:col-span-3">
                <Button type="submit" disabled={memuat} className="w-full font-bold shadow-md">
                  {memuat ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Pesan Kesalahan */}
        {kesalahan && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-center animate-in fade-in duration-300">
            {kesalahan}
          </div>
        )}

        {/* Grid Hasil */}
        {daftarLatihan && daftarLatihan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {daftarLatihan.map((latihan) => (
              <Link
                href={`/latihan/${latihan.idLatihan}`}
                key={latihan.idLatihan}
                className="group h-full"
              >
                <Card className="flex flex-col h-full border-white/30 bg-zinc-900 group-hover:border-primary/50 transition-all duration-300 overflow-hidden p-0 gap-0">
                  {/* Area Gambar */}
                  <div className="aspect-square w-full bg-white/10 relative overflow-hidden">
                    {latihan.urlGambar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={latihan.urlGambar}
                        alt={latihan.nama}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Dumbbell className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3 pt-4">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle
                        className="text-xl capitalize line-clamp-1 group-hover:text-primary transition-colors"
                        title={latihan.nama}
                      >
                        {latihan.nama}
                      </CardTitle>
                    </div>
                    <CardDescription className="capitalize">
                      {latihan.ototTarget && latihan.ototTarget.length > 0
                        ? latihan.ototTarget.join(", ")
                        : "General"}
                      {latihan.tipeLatihan && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs border border-accent/20">
                          {latihan.tipeLatihan}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 grow flex flex-col justify-end">
                    <div className="space-y-2">
                      {/* Chip Bagian Tubuh */}
                      <div className="flex flex-wrap gap-1">
                        {latihan.bagianTubuh &&
                          Array.from(new Set(latihan.bagianTubuh)).map((bt) => (
                            <span
                              key={bt}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize"
                            >
                              {bt}
                            </span>
                          ))}
                      </div>

                      {/* Chip Peralatan */}
                      <div className="flex flex-wrap gap-1 mb-5">
                        {latihan.peralatan &&
                          latihan.peralatan.map((alat) => (
                            <span
                              key={alat}
                              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border capitalize"
                            >
                              {alat}
                            </span>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          !memuat &&
          daftarLatihan !== null && (
            <div className="text-center py-12 text-muted-foreground animate-in fade-in">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Tidak ada latihan yang ditemukan.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
