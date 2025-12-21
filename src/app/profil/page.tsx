"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  CheckCircle2Icon,
  CheckIcon,
  CrownIcon,
  Loader2,
  LogOut,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
  XIcon,
  PrinterIcon,
  MailIcon,
  ReceiptIcon,
  DumbbellIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDetailLatihan, DetailLatihan } from "../actions/exercise";
import Link from "next/link";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [paketAktif, setPaketAktif] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [latihanFavorit, setLatihanFavorit] = useState<DetailLatihan[]>([]); // State untuk menyimpan data latihan favorit
  const [sedangMemuatFavorit, setSedangMemuatFavorit] = useState(false);
  const [sedangMemuatFoto, setSedangMemuatFoto] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State Formulir
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    nomorTelepon: "",
    jenisKelamin: "",
    tanggalLahir: "",
    alamat: "",
    tujuanLatihan: "",
    idPesanan: "",
    fotoProfil: "",
    paketAktifTanggal: "",
  });

  // Lindungi halaman dan Ambil Data
  useEffect(() => {
    const checkUserAndFetchData = async () => {
      if (!user) {
        // Tunggu sebentar untuk cek inisialisasi auth context dari local storage
        const timer = setTimeout(() => {
          if (!localStorage.getItem("gym_user")) {
            router.push("/login");
          }
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // Ambil data user dari Firestore
        try {
          const userRef = doc(db, "users", user.username);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            // Set paket aktif jika ada
            if (data.paketAktif) {
              setPaketAktif(data.paketAktif);

              // Isi Order ID jika hilang untuk paket aktif
              if (!data.idPesanan) {
                const newOrderId = `GYM-${Math.floor(10000 + Math.random() * 90000)}`;
                await updateDoc(userRef, { idPesanan: newOrderId });
                data.idPesanan = newOrderId; // Update untuk setFormData di bawah
              }
            }

            // Isi awal data formulir
            setFormData({
              namaLengkap: data.namaLengkap || data.name || user.name || "",
              email: data.email || "",
              nomorTelepon: data.nomorTelepon || data.phone || "",
              jenisKelamin: data.jenisKelamin || data.gender || "",
              tanggalLahir: data.tanggalLahir || data.dob || "",
              alamat: data.alamat || data.address || "",
              tujuanLatihan: data.tujuanLatihan || data.goal || "",
              idPesanan: data.idPesanan || "", // Ambil idPesanan
              fotoProfil: data.fotoProfil || "",
              paketAktifTanggal: data.paketAktifTanggal || "",
            });

            // Ambil data favorit jika ada
            if (data.favorit_latihan && Array.isArray(data.favorit_latihan)) {
              const idsFavorit = data.favorit_latihan;
              if (idsFavorit.length > 0) {
                setSedangMemuatFavorit(true);
                // Fetch detail latihan secara paralel
                Promise.all(idsFavorit.map((id: string) => getDetailLatihan(id)))
                  .then((results) => {
                    const dataLatihan = results
                      .map((res) => res.data)
                      .filter((item): item is DetailLatihan => !!item);
                    setLatihanFavorit(dataLatihan);
                  })
                  .catch((err) => console.error("Gagal mengambil latihan favorit:", err))
                  .finally(() => setSedangMemuatFavorit(false));
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    checkUserAndFetchData();
  }, [user, router]);

  // Effect terpisah untuk mengatur loading video
  useEffect(() => {
    if (isLoadingData) return; // Jangan ubah status loading foto jika data belum selesai diambil

    if (formData.fotoProfil) {
      setSedangMemuatFoto(true);
    } else {
      setSedangMemuatFoto(false);
    }
  }, [formData.fotoProfil, isLoadingData]);

  if (!user) {
    return null; // Atau spinner loading
  }

  // Paket Langganan
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
      color: "text-purple-400",
      bg: "bg-linear-to-br from-zinc-900 to-purple-950/30",
      border: "border-purple-500/50",
    },
  ];

  const pilihPaket = (planId: string) => {
    // Jika paket yang dipilih SUDAH aktif, tampilkan invoice
    if (paketAktif === planId) {
      setSelectedPlanId(planId);
      setShowInvoice(true);
    } else {
      // Jika memilih paket BARU
      setSelectedPlanId(planId);
      setIsEditing(false);
      setShowForm(true);
    }
  };

  const editProfil = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const simpanData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isEditing && !selectedPlanId) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", user.username);

      const updatePayload: any = {
        namaLengkap: formData.namaLengkap,
        email: formData.email,
        nomorTelepon: formData.nomorTelepon,
        jenisKelamin: formData.jenisKelamin,
        tanggalLahir: formData.tanggalLahir,
        alamat: formData.alamat,
        tujuanLatihan: formData.tujuanLatihan,
      };

      // Hanya update activePlan jika tidak sedang edit profil
      if (!isEditing && selectedPlanId) {
        updatePayload.paketAktif = selectedPlanId;
        // Generate Order ID BARU hanya saat ganti/aktivasi paket
        const newOrderId = `GYM-${Math.floor(10000 + Math.random() * 90000)}`;
        // Generate Tanggal Aktif BARU (yyyy-mm-dd) - Gunakan Waktu Lokal Client
        const d = new Date();
        const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

        updatePayload.paketAktif = selectedPlanId;
        updatePayload.idPesanan = newOrderId;
        updatePayload.paketAktifTanggal = newDate;

        // Update state lokal segera
        setFormData((prev) => ({
          ...prev,
          idPesanan: newOrderId,
          paketAktifTanggal: newDate,
        }));
      }

      // Update Firestore
      await updateDoc(userRef, updatePayload);

      if (!isEditing && selectedPlanId) {
        setPaketAktif(selectedPlanId);
      }

      setShowForm(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ubahInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const ubahPilihan = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const cetakStruk = () => {
    const originalTitle = document.title;
    document.title = `Invoice_${formData.idPesanan || "GYM"}_${formData.namaLengkap.replace(
      /\s+/g,
      "_"
    )}`;
    window.print();
    document.title = originalTitle;
  };

  const kirimEmail = async () => {
    const activePlanDetails = plans.find((p) => p.id === selectedPlanId);
    if (!activePlanDetails) return;

    // Pastikan Order ID tersedia (seharusnya sudah di-set oleh useEffect atau submit form)
    const currentOrderId = formData.idPesanan;
    if (!currentOrderId) {
      alert("ID Pesanan belum tersedia. Harap refresh halaman.");
      return;
    }

    setIsSendingEmail(true);
    setIsSendingEmail(true);
    try {
      const response = await fetch(`${API_URL}/send-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.namaLengkap,
          packageName: activePlanDetails.name,
          price: activePlanDetails.price,
          date: formData.paketAktifTanggal
            ? new Date(formData.paketAktifTanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : new Date().toLocaleDateString("id-ID"),
          orderId: currentOrderId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowEmailSuccess(true);
        setTimeout(() => {
          setShowEmailSuccess(false);
        }, 3000);
      } else {
        console.error("Respon Error Server:", result);
        alert(
          "Gagal mengirim email: " +
            (result.details || result.error || "Terjadi kesalahan pada server")
        );
      }
    } catch (error) {
      console.error("Error saat mengirim email:", error);
      alert("Gagal menghubungi server email. Pastikan server backend berjalan.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const batalkanLangganan = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", user.username);
      await updateDoc(userRef, {
        paketAktif: null,
        idPesanan: null,
        paketAktifTanggal: null,
      });
      setPaketAktif(null);
      setFormData((prev) => ({ ...prev, idPesanan: "" })); // Reset state lokal
      setShowCancelConfirm(false);
      toast.success("Langganan berhasil dibatalkan.");
    } catch (error) {
      console.error("Gagal membatalkan langganan:", error);
      toast.error("Gagal membatalkan langganan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Bagian Header Profil */}
      <section className="relative pt-32 pb-12 px-4 bg-linear-to-b from-zinc-900 to-background border-b border-border/50">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full flex items-center justify-center text-black shadow-2xl ring-4 ring-black/50 overflow-hidden relative">
            {(isLoadingData || sedangMemuatFoto) && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}

            {formData.fotoProfil && (
              <img
                src={formData.fotoProfil}
                alt={user.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isLoadingData || sedangMemuatFoto ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setSedangMemuatFoto(false)}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  setSedangMemuatFoto(false);
                }}
              />
            )}

            {!isLoadingData && !formData.fotoProfil && !sedangMemuatFoto && (
              <span className="text-5xl font-black italic absolute">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info Pengguna */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">{user.name}</h1>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-muted-foreground">
              <span className="text-lg">@{user.username}</span>
            </div>
          </div>

          {/* Tombol Edit */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-zinc-700 hover:bg-zinc-800 text-foreground"
              onClick={editProfil}
            >
              <SettingsIcon className="w-4 h-4" />
              Edit Profil
            </Button>
            <Button
              className="gap-2 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Bagian Latihan Favorit */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                <StarIcon className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                Latihan Favorit Saya
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Akses cepat ke latihan yang Anda simpan.
              </p>
            </div>
          </div>

          <div className="border border-dashed border-zinc-600 rounded-xl bg-zinc-950/30 p-6 md:p-8">
            {sedangMemuatFavorit ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : latihanFavorit.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latihanFavorit.map((latihan) => (
                  <Link
                    key={latihan.idLatihan}
                    href={`/latihan/${latihan.idLatihan}`}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all hover:border-primary/50"
                  >
                    <div className="aspect-square overflow-hidden bg-white/5 p-4 relative">
                      <img
                        src={latihan.urlGambar}
                        alt={latihan.nama}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-white truncate group-hover:text-primary transition-colors">
                        {latihan.nama}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {latihan.bagianTubuh?.[0] || latihan.ototTarget?.[0] || "Umum"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DumbbellIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white">Belum ada favorit</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                  Jelajahi latihan dan klik ikon hati untuk menyimpannya di sini.
                </p>
                <Button asChild className="mt-6" variant="outline">
                  <Link href="/list-latihan">Cari Latihan</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <hr className="border-zinc-800 my-12" />

        {paketAktif ? (
          // UI TAMPILAN JIKA SUDAH PUNYA PAKET
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                  <CrownIcon className="w-6 h-6 text-primary fill-primary/20" />
                  Paket Anda Saat Ini
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Detail status keanggotaan dan tagihan Anda.
                </p>
              </div>
            </div>

            {(() => {
              const currentPlan = plans.find((p) => p.id === paketAktif);
              if (!currentPlan) return null;

              return (
                <Card
                  className={`w-full overflow-hidden border-2 ${currentPlan.border} bg-zinc-950/50 shadow-2xl flex flex-col md:flex-row`}
                >
                  {/* Left Side: Plan Details */}
                  <div className="flex-1 relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-10 ${currentPlan.bg}`} />
                    <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between mb-8">
                      <div className="space-y-8">
                        {/* Header Part */}
                        <div className="flex justify-between items-start gap-6">
                          <div className="flex items-center gap-6">
                            <div
                              className={`p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl ${currentPlan.color}`}
                            >
                              <currentPlan.icon className="w-12 h-12" />
                            </div>
                            <div>
                              <h3
                                className={`text-3xl font-black uppercase tracking-tight ${currentPlan.color}`}
                              >
                                {currentPlan.name}
                              </h3>
                              <p className="text-zinc-400 mt-1 text-lg">
                                {currentPlan.description}
                              </p>
                            </div>
                          </div>

                          <div className="text-right hidden md:block">
                            <div className="text-sm text-zinc-500 uppercase font-bold tracking-widest mb-1">
                              Status
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 text-green-500 font-bold border border-green-500/20">
                              <CheckCircle2Icon className="w-4 h-4" />
                              <span>AKTIF</span>
                            </div>
                          </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-8 border-t border-zinc-800/50">
                          {currentPlan.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div
                                className={`p-1.5 rounded-full ${
                                  currentPlan.bg ? "bg-primary/10" : "bg-zinc-800"
                                }`}
                              >
                                <CheckIcon
                                  className={`w-4 h-4 ${currentPlan.color || "text-primary"}`}
                                />
                              </div>
                              <span className="text-zinc-300 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Status Only */}
                      <div className="mt-8 md:hidden flex justify-between items-center border-t border-zinc-800 pt-4">
                        <span className="text-sm text-zinc-500 uppercase font-bold tracking-widest">
                          Status
                        </span>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 text-green-500 font-bold border border-green-500/20">
                          <CheckCircle2Icon className="w-4 h-4" />
                          <span>AKTIF</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Sidebar Actions */}
                  <div className="w-full md:w-80 shrink-0 border-l-0 md:border-l border-t md:border-t-0 border-dashed border-zinc-700 bg-zinc-900/10 p-8 flex flex-col justify-center gap-8 relative">
                    {/* Decorative pattern for sidebar */}
                    <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]"></div>

                    <div className="relative z-10 space-y-6">
                      <div>
                        <p className="text-sm text-zinc-500 font-medium mb-1">
                          Total Tagihan Bulanan
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">
                            {currentPlan.price}
                          </span>
                          <span className="text-zinc-500 text-sm font-medium">/bulan</span>
                        </div>
                      </div>

                      <div className="h-px bg-zinc-800 w-full border-b border-dashed border-zinc-700/50" />

                      <div className="flex flex-col gap-3">
                        <Button
                          className="w-full gap-2 h-12 font-bold text-black shadow-lg shadow-primary/10"
                          onClick={() => {
                            setSelectedPlanId(currentPlan.id);
                            setShowInvoice(true);
                          }}
                        >
                          <ReceiptIcon className="w-4 h-4" />
                          Lihat Invoice
                        </Button>

                        <Button
                          className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white h-10"
                          onClick={() => setShowCancelConfirm(true)}
                        >
                          <XIcon className="w-4 h-4" />
                          Batalkan Langganan
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>
        ) : (
          // UI PILIHAN PAKET (JIKA BELUM PUNYA PAKET)
          <>
            <div className="flex flex-col items-center mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Pilihan Paket Membership</h2>
              <p className="text-muted-foreground max-w-xl">
                Upgrade membership Anda untuk mendapatkan akses lebih banyak fasilitas dan manfaat
                eksklusif.
              </p>
            </div>

            {/* Grid Paket */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => {
                // Jangan tampilkan jika paketAktif (Logic fallback redundant but safe)
                const isCurrent = paketAktif === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                      plan.bg
                    } ${plan.border} ${
                      isCurrent
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/10 cursor-pointer"
                        : "border border-zinc-800"
                    }`}
                    onClick={() => isCurrent && pilihPaket(plan.id)}
                  >
                    {isCurrent && <div className="absolute top-0 inset-x-0 bg-primary h-1" />}

                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-zinc-950/50 ${plan.color}`}>
                          <plan.icon className="w-8 h-8" />
                        </div>
                        {isCurrent && (
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
                                isCurrent ? "text-primary" : "text-zinc-500"
                              }`}
                            />
                            <span className="text-zinc-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className={`w-full font-bold cursor-pointer ${
                          isCurrent
                            ? "bg-zinc-800 hover:bg-zinc-700 text-white hover:bg-zinc-600"
                            : "bg-primary text-black hover:bg-primary/90"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          pilihPaket(plan.id);
                        }}
                      >
                        {isCurrent ? "Lihat Detail Invoice" : "Pilih Paket"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Invoice - Tampilan WEB */}
      {showInvoice && selectedPlanId && (
        <>
          {/* Modal Layar */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
            <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
              <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ReceiptIcon className="w-5 h-5 text-primary" />
                    <CardTitle>Invoice Pembayaran</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowInvoice(false)}>
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Detail Invoice */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                    <div>
                      <p className="text-sm text-zinc-400">Order ID</p>
                      <p className="font-mono text-white tracking-widest">
                        {formData.idPesanan || "PENDING"}
                      </p>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-xs border border-primary/20">
                          <CheckCircle2Icon className="w-3 h-3" /> LUNAS
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Tanggal</p>
                      <p className="font-medium text-white">
                        {formData.paketAktifTanggal
                          ? new Date(formData.paketAktifTanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : new Date().toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Nama</p>
                      <p className="font-semibold text-white truncate">{formData.namaLengkap}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Email</p>
                      <p className="font-semibold text-white truncate">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Nomor HP</p>
                      <p className="font-semibold text-white">{formData.nomorTelepon}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Paket</p>
                      <p className="font-semibold text-primary">
                        {plans.find((p) => p.id === selectedPlanId)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900 rounded-lg flex justify-between items-center">
                    <span className="text-zinc-400">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-white">
                      {plans.find((p) => p.id === selectedPlanId)?.price}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 bg-zinc-900/30 p-6 border-t border-zinc-800">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-zinc-700"
                  onClick={cetakStruk}
                >
                  <PrinterIcon className="w-4 h-4" />
                  Cetak PDF
                </Button>
                <Button
                  className="flex-1 gap-2 bg-primary text-black hover:bg-primary/90"
                  onClick={kirimEmail}
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MailIcon className="w-4 h-4" />
                  )}
                  Kirim ke Email
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* TAMPILAN CETAK SAJA */}
          <div className="hidden printable-area">
            <div className="w-[380px] border border-gray-200 bg-white text-black p-8 font-mono text-sm shadow-sm relative overflow-hidden">
              {/* Hiasan Atas */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)] opacity-10"></div>

              {/* Header */}
              <div className="text-center space-y-2 pb-6 border-b-2 border-dashed border-gray-300">
                <h2 className="text-xl font-black uppercase tracking-widest text-black">
                  INVOICE UNPGYM
                </h2>
                <p className="text-xs text-gray-500">
                  Jalan Prof. Dr. Hamka, Air Tawar
                  <br />
                  Padang, Sumatera Barat
                </p>
              </div>

              {/* Meta */}
              <div className="flex justify-between text-xs text-gray-500 py-3">
                <span>
                  {formData.paketAktifTanggal
                    ? new Date(formData.paketAktifTanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                </span>
              </div>

              {/* Barang/Item */}
              <div className="py-4 space-y-3">
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-xs uppercase">No. Order</span>
                  <span className="font-bold tracking-widest">
                    {formData.idPesanan || "GYM-REF"}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-xs uppercase">Member</span>
                  <span className="font-bold uppercase">{formData.namaLengkap}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-xs uppercase">Paket</span>
                  <span className="font-bold uppercase text-lime-700">
                    {plans.find((p) => p.id === selectedPlanId)?.name}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-6 border-b-2 border-dashed border-gray-300">
                <span className="text-lg font-bold">TOTAL</span>
                <span className="text-2xl font-black text-black">
                  {plans.find((p) => p.id === selectedPlanId)?.price}
                </span>
              </div>

              {/* Status Footer */}
              <div className="text-center pt-8 space-y-4">
                <div className="inline-block px-4 py-1 border-2 border-black rounded uppercase font-bold text-xs tracking-widest">
                  LUNAS
                </div>
                <p className="text-xs text-gray-400">Terima kasih telah bergabung dengan kami!</p>
              </div>

              {/* Garis Potong */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pb-2 opacity-30">
                {"- - - - - - - - - - - - - - - - - - - - - - - - -".split("").map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Sukses Email */}
      <AlertDialog open={showEmailSuccess} onOpenChange={setShowEmailSuccess}>
        <AlertDialogContent className="bg-zinc-950 border border-zinc-900 shadow-2xl overflow-hidden max-w-sm p-0">
          <AlertDialogTitle className="sr-only">Email Terkirim</AlertDialogTitle>
          <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-950/50">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 ring-4 ring-primary/10 animate-bounce cursor-default">
              <MailIcon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black italic text-white mb-2 uppercase tracking-tighter">
              TERKIRIM!
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Invoice telah berhasil dikirim ke email{" "}
              <span className="text-white font-semibold">{formData.email}</span>
            </p>
          </div>

          {/* Animasi Bar Progress */}
          <div className="h-1 w-full bg-zinc-900">
            <div className="h-full bg-primary animate-[progress_3s_ease-in-out_forwards]" />
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Konfirmasi Logout */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari akun Anda?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                setShowLogoutConfirm(false);
                logout();
                toast.success("Berhasil keluar dari akun");
              }}
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Konfirmasi Batal Langganan */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Langganan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan langganan membership Anda? Anda akan kehilangan
              akses ke fasilitas member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={batalkanLangganan}
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Formulir Registrasi/Edit Profil */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card
            className={`w-full ${
              isEditing ? "max-w-md" : "max-w-2xl"
            } bg-zinc-950 border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 transition-all`}
          >
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-zinc-950 z-10 border-b border-zinc-800">
              <div>
                <CardTitle>{isEditing ? "Edit Profil" : "Lengkapi Data Diri"}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEditing
                    ? "Perbarui informasi pribadi Anda."
                    : "Mohon isi data berikut untuk mengaktifkan paket Anda."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
                className="hover:bg-zinc-800 rounded-full"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={simpanData} className="space-y-6">
                <div className={`grid grid-cols-1 ${!isEditing ? "md:grid-cols-2" : ""} gap-6`}>
                  <div className="space-y-2">
                    <Label htmlFor="namaLengkap" className="text-zinc-300">
                      Nama Lengkap
                    </Label>
                    <Input
                      id="namaLengkap"
                      placeholder="Masukkan nama lengkap"
                      required
                      value={formData.namaLengkap}
                      onChange={ubahInput}
                      className=""
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contoh@email.com"
                      required
                      value={formData.email}
                      onChange={ubahInput}
                    />
                  </div>

                  {!isEditing && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="nomorTelepon" className="text-zinc-300">
                          Nomor HP
                        </Label>
                        <Input
                          id="nomorTelepon"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          required
                          value={formData.nomorTelepon}
                          onChange={ubahInput}
                          className=""
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jenisKelamin" className="text-zinc-300">
                          Jenis Kelamin
                        </Label>
                        <Select
                          onValueChange={(val) => ubahPilihan("jenisKelamin", val)}
                          required
                          defaultValue={formData.jenisKelamin}
                        >
                          <SelectTrigger className="bg-zinc-900 border-zinc-700 focus:ring-primary">
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tanggalLahir" className="text-zinc-300">
                          Tanggal Lahir
                        </Label>
                        <Input
                          id="tanggalLahir"
                          type="date"
                          required
                          value={formData.tanggalLahir}
                          onChange={ubahInput}
                          className=" scheme-dark"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tujuanLatihan" className="text-zinc-300">
                          Tujuan Latihan
                        </Label>
                        <Select
                          onValueChange={(val) => ubahPilihan("tujuanLatihan", val)}
                          required
                          defaultValue={formData.tujuanLatihan}
                        >
                          <SelectTrigger className="bg-zinc-900 border-zinc-700 focus:ring-primary">
                            <SelectValue placeholder="Pilih tujuan latihan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Menurunkan Berat Badan">
                              Menurunkan Berat Badan
                            </SelectItem>
                            <SelectItem value="Membentuk Otot">Membentuk Otot</SelectItem>
                            <SelectItem value="Meningkatkan Stamina">
                              Meningkatkan Stamina
                            </SelectItem>
                            <SelectItem value="Kesehatan Umum">Kesehatan Umum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="alamat" className="text-zinc-300">
                      Alamat Domisili
                    </Label>
                    <Textarea
                      id="alamat"
                      placeholder="Alamat lengkap domisili saat ini"
                      required
                      value={formData.alamat}
                      onChange={ubahInput}
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-black hover:bg-primary/90 font-bold px-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : isEditing ? (
                      "Simpan Perubahan"
                    ) : (
                      "Simpan & Aktifkan Paket"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Notifikasi Sukses */}
      {showSuccess && (paketAktif || isEditing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md bg-zinc-950 border-primary/20 shadow-[0_0_50px_rgba(163,230,53,0.1)] animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-2 animate-in zoom-in duration-500 delay-150">
                <CheckCircle2Icon className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black italic tracking-tighter text-white">
                  {isEditing ? "BERHASIL!" : "SELAMAT!"}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {isEditing ? (
                    "Profil Anda berhasil diperbarui."
                  ) : (
                    <>
                      Paket{" "}
                      <span className="text-primary font-bold">
                        {plans.find((p) => p.id === paketAktif)?.name}
                      </span>{" "}
                      berhasil diaktifkan.
                    </>
                  )}
                </p>
              </div>

              <div className="w-full bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-sm text-zinc-400">
                  {isEditing ? (
                    "Data profil terbaru Anda telah tersimpan."
                  ) : (
                    <>
                      Terima kasih{" "}
                      <span className="text-white font-semibold">{formData.namaLengkap}</span>,
                      perjalanan kebugaran Anda dimulai sekarang!
                    </>
                  )}
                </p>
              </div>

              <Button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-primary text-black font-black text-lg h-12 tracking-wide hover:bg-primary/90 hover:scale-105 transition-all"
              >
                {isEditing ? "TUTUP" : "MULAI LATIHAN"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
