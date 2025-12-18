"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getNutritionData } from "../actions/nutrition";
import { Loader2, Search } from "lucide-react";

interface NutritionResult {
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  protein_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
}

export default function NutritionCheckerPage() {
  const [query, setQuery] = React.useState("");

  const [result, setResult] = React.useState<NutritionResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await getNutritionData(query);
      if (resp.error) {
        setError(resp.error);
      } else if (resp.data) {
        // Cek apakah ada return array
        if (Array.isArray(resp.data) && resp.data.length > 0) {
          setResult(resp.data[0]);
        } else if (typeof resp.data === "object") {
          setResult(resp.data);
        } else {
          setError("Makanan tidak ditemukan.");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
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

        {/* Input Form */}
        <Card className="border-border/50 bg-zinc-900 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleCheck} className="grid md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-4">
                <Label htmlFor="input" className="mb-3 block">
                  Masukkan Makanan
                </Label>
                <Input
                  id="input"
                  placeholder="Contoh: 1 potong ayam dan 2 butir telur..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-background/50"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full shadow-md font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cek"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-center animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {/* Hasil */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Main Stats */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl md:col-span-2 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
              <CardHeader>
                <CardTitle className="text-3xl capitalize flex items-center gap-2">
                  {result.name}
                  <span className="text-sm font-normal text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border">
                    {result.serving_size_g}g serving size
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Protein</p>
                    <div className="text-6xl font-bold text-blue-500 tracking-tighter">
                      {result.protein_g}{" "}
                      <span className="text-xl text-muted-foreground font-normal">g</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Kalori</p>
                    <div className="text-6xl font-bold text-primary tracking-tighter">
                      {result.calories}{" "}
                      <span className="text-xl text-muted-foreground tracking-normal font-normal">
                        kkal
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Macro Details */}
            <Card className="border-border/50 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-xl">Makronutrisi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="font-medium text-foreground">Karbohidrat</span>
                  <span className="font-bold text-green-500">{result.carbohydrates_total_g}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="font-medium text-foreground">Lemak Total</span>
                  <span className="font-bold text-yellow-500">{result.fat_total_g}g</span>
                </div>
                <div className="flex justify-between items-center px-3 py-1 text-sm text-muted-foreground">
                  <span>Lemak Jenuh</span>
                  <span>{result.fat_saturated_g}g</span>
                </div>
              </CardContent>
            </Card>

            {/* Micro Details */}
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
                    <div className="font-bold text-foreground">{result.sugar_g}g</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Serat
                    </div>
                    <div className="font-bold text-foreground">{result.fiber_g}g</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Sodium
                    </div>
                    <div className="font-bold text-foreground">{result.sodium_mg}mg</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Kolesterol
                    </div>
                    <div className="font-bold text-foreground">{result.cholesterol_mg}mg</div>
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
