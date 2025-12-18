"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDataNutrisi } from "../actions/nutrition";
import { Loader2 } from "lucide-react";

// Interface Hasil Nutrisi sesuai dengan respon JSON dari Gemini
interface HasilNutrisi {
  nama?: string;
  kalori: number;
  berat_sajian_g: number;
  lemak_total_g: number;
  lemak_jenuh_g: number;
  protein_g: number;
  sodium_mg: number;
  kalium_mg: number;
  kolesterol_mg: number;
  karbohidrat_total_g: number;
  serat_g: number;
  gula_g: number;
  item?: {
    nama: string;
    jumlah: number;
    satuan: string;
  }[];
}

export default function HalamanCekNutrisi() {
  const [pencarian, setPencarian] = React.useState("");

  const [hasil, setHasil] = React.useState<HasilNutrisi | null>(null);
  const [memuat, setMemuat] = React.useState(false);
  const [kesalahan, setKesalahan] = React.useState<string | null>(null);

  const handleCek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pencarian) return;

    setMemuat(true);
    setKesalahan(null);
    setHasil(null);

    try {
      const respon = await getDataNutrisi(pencarian);
      if (respon.error) {
        setKesalahan(respon.error);
      } else if (respon.data) {
        // Cek apakah ada return array
        if (Array.isArray(respon.data) && respon.data.length > 0) {
          setHasil(respon.data[0]);
        } else if (typeof respon.data === "object") {
          setHasil(respon.data);
        } else {
          setKesalahan("Makanan tidak ditemukan.");
        }
      }
    } catch (err) {
      setKesalahan("Terjadi kesalahan saat mengambil data.");
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100svh-65px)] flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">
            Cek <span className="text-primary">Nutrisi</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Ketahui kandungan nutrisi makanan Anda dengan akurat. Masukkan nama makanan dan
            jumlahnya.
          </p>
        </div>

        {/* Form Input */}
        <Card className="border-border/50 bg-zinc-900 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleCek} className="grid md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-4">
                <Label htmlFor="input" className="mb-3 block">
                  Masukkan Makanan
                </Label>
                <Input
                  id="input"
                  placeholder="Contoh: 1 potong ayam dan 2 butir telur..."
                  value={pencarian}
                  onChange={(e) => setPencarian(e.target.value)}
                  className="bg-background/50"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" disabled={memuat} className="w-full shadow-md font-bold">
                {memuat ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cek"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pesan Kesalahan */}
        {kesalahan && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-center animate-in fade-in duration-300">
            {kesalahan}
          </div>
        )}

        {/* Hasil */}
        {hasil && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Statistik Utama */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl md:col-span-2 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500 to-amber-500" />
              <CardHeader>
                <CardTitle className="text-3xl capitalize flex flex-col gap-2">
                  <span>Hasil Analisis</span>
                  {hasil.item && (
                    <div className="flex flex-wrap gap-2">
                      {hasil.item.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-sm font-normal text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border"
                        >
                          {item.jumlah} {item.satuan} {item.nama}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-sm font-normal text-muted-foreground mt-1">
                    Total Berat: {hasil.berat_sajian_g}g
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Protein</p>
                    <div className="text-6xl font-bold text-blue-500 tracking-tighter">
                      {hasil.protein_g}{" "}
                      <span className="text-xl text-muted-foreground font-normal">g</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Kalori</p>
                    <div className="text-6xl font-bold text-primary tracking-tighter">
                      {hasil.kalori}{" "}
                      <span className="text-xl text-muted-foreground tracking-normal font-normal">
                        kkal
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detail Makronutrisi */}
            <Card className="border-border/50 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-xl">Makronutrisi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="font-medium text-foreground">Karbohidrat</span>
                  <span className="font-bold text-green-500">{hasil.karbohidrat_total_g}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="font-medium text-foreground">Lemak Total</span>
                  <span className="font-bold text-yellow-500">{hasil.lemak_total_g}g</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1 text-sm text-muted-foreground">
                  <span>Lemak Jenuh</span>
                  <span>{hasil.lemak_jenuh_g}g</span>
                </div>
              </CardContent>
            </Card>

            {/* Detail Mikronutrisi & Lainnya */}
            <Card className="border-border/50 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-xl">Mikronutrisi & Lainnya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Gula
                    </div>
                    <div className="font-bold text-foreground">{hasil.gula_g}g</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Serat
                    </div>
                    <div className="font-bold text-foreground">{hasil.serat_g}g</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Sodium
                    </div>
                    <div className="font-bold text-foreground">{hasil.sodium_mg}mg</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Kolesterol
                    </div>
                    <div className="font-bold text-foreground">{hasil.kolesterol_mg}mg</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
