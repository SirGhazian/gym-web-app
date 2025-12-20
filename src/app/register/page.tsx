"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

function RegisterContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const daftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const checkUsername = formData.username.replace(/\s+/g, "").toLowerCase();

    try {
      // Cek apakah username sudah ada
      const userRef = doc(db, "users", checkUsername);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        throw new Error("Username sudah digunakan. Silakan pilih username lain.");
      }

      // Simpan Data Pengguna ke Firestore (gunakan username sebagai ID)
      await setDoc(userRef, {
        username: checkUsername,
        name: formData.name,
        email: formData.email,
        password: formData.password, // Menyimpan teks biasa sesuai permintaan konteks penyimpanan DB sederhana
        createdAt: serverTimestamp(),
        activePlan: null, // Inisialisasi paket kosong
      });

      // Arahkan ke Login
      router.push("/login");
    } catch (error: any) {
      console.error("Registration Error:", error);
      let errorMessage = error.message || "Terjadi kesalahan saat mendaftar.";

      // Tangani kesalahan izin secara spesifik
      if (
        error.code === "permission-denied" ||
        (error.message && error.message.includes("permission-denied"))
      ) {
        errorMessage =
          "Gagal menyimpan data: Izin Firestore ditolak. Cek Rules di Firebase Console.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-65px)] bg-background flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Daftar Akun Baru</CardTitle>
            <CardDescription className="text-center">
              Buat akun untuk memulai perjalanan fitness Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={daftar} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Ucok Baba"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ucok@contoh.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="ucok123"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.replace(/\s+/g, "").toLowerCase(),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <Button
                  className="w-full bg-primary text-black font-bold hover:bg-primary/90"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    "Daftar Sekarang"
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Login disini
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
