"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const checkUsername = formData.username.replace(/\s+/g, "").toLowerCase();

    try {
      // Check directly in Firestore
      const userRef = doc(db, "users", checkUsername);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("Username tidak ditemukan.");
      }

      const userData = userSnap.data();

      // Simple password check (Insecure for production, but per request)
      if (userData.password !== formData.password) {
        throw new Error("Password salah.");
      }

      // Success - Save simplistic session to localStorage
      // Success - Save simplistic session via Context
      login({
        username: checkUsername,
        name: userData.name,
      });

      router.push("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = error.message || "Gagal masuk.";

      if (error.code === "permission-denied") {
        errorMessage =
          "Gagal mengakses data: Izin Firestore ditolak. Cek Rules di Firebase Console.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login Member</CardTitle>
            <CardDescription className="text-center">
              Masukan username dan password untuk masuk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

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
                      Masuk...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Daftar disini
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
