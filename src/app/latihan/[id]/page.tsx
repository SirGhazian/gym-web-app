"use client";

import * as React from "react";
import { getDetailLatihan, DetailLatihan } from "../../actions/exercise";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart } from "lucide-react";

// Komponen utama halaman detail latihan
export default function HalamanDetailLatihan() {
  const params = useParams();
  const id = params?.id as string;

  const { user } = useAuth(); // Ambil user dari context
  const [latihan, setLatihan] = React.useState<DetailLatihan | null>(null);
  const [memuat, setMemuat] = React.useState(true);
  const [kesalahan, setKesalahan] = React.useState<string | null>(null);
  const [apakahFavorit, setApakahFavorit] = React.useState(false); // State untuk status favorit

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

  // Efek untuk cek apakah latihan sudah difavoritkan saat user dimuat
  React.useEffect(() => {
    const cekStatusFavorit = async () => {
      if (!user || !id) return;

      try {
        const userRef = doc(db, "users", user.username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          // Cek apakah id ada di array favorit_latihan
          if (
            data.favorit_latihan &&
            Array.isArray(data.favorit_latihan) &&
            data.favorit_latihan.includes(id)
          ) {
            setApakahFavorit(true);
          } else {
            setApakahFavorit(false);
          }
        }
      } catch (err) {
        console.error("Gagal mengecek status favorit:", err);
      }
    };

    cekStatusFavorit();
  }, [user, id]);

  // Fungsi untuk toggle favorit (tambah/hapus)
  const ubahFavorit = async () => {
    if (!user) {
      alert("Silakan login untuk menyimpan favorit!");
      return;
    }

    // Optimistic UI update (ubah tampilan dulu biar responsif)
    const statusBaru = !apakahFavorit;
    setApakahFavorit(statusBaru);

    try {
      const userRef = doc(db, "users", user.username);

      if (statusBaru) {
        // Tambahkan ke array menggunakan arrayUnion
        await updateDoc(userRef, {
          favorit_latihan: arrayUnion(id),
        });
      } else {
        // Hapus dari array menggunakan arrayRemove
        await updateDoc(userRef, {
          favorit_latihan: arrayRemove(id),
        });
      }
    } catch (err) {
      console.error("Gagal mengubah favorit:", err);
      // Rollback jika gagal
      setApakahFavorit(!statusBaru);
      alert("Gagal menyimpan perubahan favorit.");
    }
  };

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
            <div className="flex items-center justify-between gap-4 mb-2">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary">
                {latihan.nama}
              </h1>
              <Button
                variant="outline"
                size="icon"
                onClick={ubahFavorit}
                className="rounded-full w-12 h-12 border-2 border-primary/20 bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all shrink-0"
                title={apakahFavorit ? "Hapus dari Favorit" : "Tambah ke Favorit"}
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    apakahFavorit ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`}
                />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground capitalize">
              <span>
                Target: <span className="text-foreground">{latihan.ototTarget.join(", ")}</span>
              </span>
              {latihan.ototSekunder.length > 0 && (
                <>
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
