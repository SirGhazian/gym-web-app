"use client";

import * as React from "react";
import { getDetailLatihan, DetailLatihan } from "../../actions/exercise";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";

// Komponen utama halaman detail latihan
export default function HalamanDetailLatihan() {
  const params = useParams();
  const id = params?.id as string;

  const [latihan, setLatihan] = React.useState<DetailLatihan | null>(null);
  const [memuat, setMemuat] = React.useState(true);
  const [kesalahan, setKesalahan] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;

    // Fungsi async untuk mengambil data detail latihan berdasarkan ID
    const ambilData = async () => {
      try {
        setMemuat(true);
        const respon = await getDetailLatihan(id);

        if (respon.error) {
          setKesalahan(respon.error);
        } else if (respon.data) {
          setLatihan(respon.data);
        }
      } catch (err) {
        setKesalahan("Gagal mengambil detail latihan.");
      } finally {
        setMemuat(false);
      }
    };

    ambilData();
  }, [id]);

  if (memuat) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (kesalahan || !latihan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Oops!</h1>
        <p className="text-muted-foreground">{kesalahan || "Latihan tidak ditemukan."}</p>
        <Button asChild variant="outline">
          <Link href="/list-latihan">Kembali ke List Latihan</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100svh-65px)] pt-8 pb-12 px-4 container mx-auto max-w-5xl animate-in fade-in duration-500">
      <Button asChild variant="ghost" className="mb-6 hover:bg-background/0 p-0 -ml-2">
        <Link
          href="/list-latihan"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke List
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Media & Statistik Cepat */}
        <div className="space-y-6">
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/10 shadow-2xl group">
            {latihan.urlVideo ? (
              <video
                src={latihan.urlVideo}
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                className="w-full h-full object-contain bg-black/50"
              />
            ) : (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={latihan.urlGambar}
                  alt={latihan.nama}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Tipe</p>
                <p className="font-bold text-lg capitalize text-primary">{latihan.tipeLatihan}</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Bagian Tubuh
                </p>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {latihan.bagianTubuh.map((bt) => (
                    <span key={bt} className="text-sm font-semibold capitalize">
                      {bt}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail Latihan */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-primary">
              {latihan.nama}
            </h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground capitalize">
              <span>
                Target: <span className="text-foreground">{latihan.ototTarget.join(", ")}</span>
              </span>
              {latihan.ototSekunder.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Sekunder:{" "}
                    <span className="text-foreground">{latihan.ototSekunder.join(", ")}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
            <p>{latihan.ringkasan}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Instruksi</h3>
            <ol className="list-decimal list-outside pl-5 space-y-3 marker:text-primary/50">
              {latihan.instruksi.map((langkah, idx) => (
                <li key={idx} className="pl-2">
                  {langkah}
                </li>
              ))}
            </ol>
          </div>

          {latihan.tipsLatihan && latihan.tipsLatihan.length > 0 && (
            <div className="space-y-4 bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
              <h3 className="text-xl font-semibold text-amber-500 flex items-center gap-2">
                Tips & Peringatan
              </h3>
              <ul className="space-y-2">
                {latihan.tipsLatihan.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-amber-200/80">
                    <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-500 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {latihan.variasi && latihan.variasi.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Variasi</h3>
              <div className="flex flex-wrap gap-2">
                {latihan.variasi.map((v, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition-colors cursor-default"
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
