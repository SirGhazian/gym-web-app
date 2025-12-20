"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // State Formulir
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    goal: "",
    orderId: "",
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
            if (data.activePlan) {
              setActivePlan(data.activePlan);

              // Isi Order ID jika hilang untuk paket aktif (Dukungan versi lama)
              if (!data.orderId) {
                const newOrderId = `GYM-${Math.floor(
                  10000 + Math.random() * 90000
                )}`;
                await updateDoc(userRef, { orderId: newOrderId });
                data.orderId = newOrderId; // Update untuk setFormData di bawah
              }
            }

            // Isi awal data formulir
            setFormData({
              fullName: data.name || user.name || "",
              email: data.email || "",
              phone: data.phone || "",
              gender: data.gender || "",
              dob: data.dob || "",
              address: data.address || "",
              goal: data.goal || "",
              orderId: data.orderId || "", // Ambil orderId
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    checkUserAndFetchData();
  }, [user, router]);

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
    if (activePlan === planId) {
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
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
        goal: formData.goal,
      };

      // Hanya update activePlan jika tidak sedang edit profil
      if (!isEditing && selectedPlanId) {
        updatePayload.activePlan = selectedPlanId;
        // Generate Order ID BARU hanya saat ganti/aktivasi paket
        const newOrderId = `GYM-${Math.floor(10000 + Math.random() * 90000)}`;
        updatePayload.orderId = newOrderId;

        // Update state lokal segera
        setFormData((prev) => ({ ...prev, orderId: newOrderId }));
      }

      // Update Firestore
      await updateDoc(userRef, updatePayload);

      if (!isEditing && selectedPlanId) {
        setActivePlan(selectedPlanId);
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

  const ubahInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const ubahPilihan = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const cetakStruk = () => {
    const originalTitle = document.title;
    document.title = `Invoice_${
      formData.orderId || "GYM"
    }_${formData.fullName.replace(/\s+/g, "_")}`;
    window.print();
    document.title = originalTitle;
  };

  const kirimEmail = async () => {
    const activePlanDetails = plans.find((p) => p.id === selectedPlanId);
    if (!activePlanDetails) return;

    // Pastikan Order ID tersedia (seharusnya sudah di-set oleh useEffect atau submit form)
    const currentOrderId = formData.orderId;
    if (!currentOrderId) {
      alert("Order ID belum tersedia. Harap refresh halaman.");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch("http://localhost:3001/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName,
          packageName: activePlanDetails.name,
          price: activePlanDetails.price,
          date: new Date().toLocaleDateString("id-ID"),
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
      alert(
        "Gagal menghubungi server email. Pastikan server backend berjalan."
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Bagian Header Profil */}
      <section className="relative pt-32 pb-12 px-4 bg-linear-to-b from-zinc-900 to-background border-b border-border/50">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-lime-600 flex items-center justify-center text-black shadow-2xl ring-4 ring-black/50">
            <span className="text-5xl font-black italic">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info Pengguna */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              {user.name}
            </h1>
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
            <Button variant="destructive" className="gap-2" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Pilihan Paket Membership
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Upgrade membership Anda untuk mendapatkan akses lebih banyak
            fasilitas dan manfaat eksklusif.
          </p>
        </div>

        {/* Grid Paket */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = activePlan === plan.id;
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
                {isCurrent && (
                  <div className="absolute top-0 inset-x-0 bg-primary h-1" />
                )}

                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl bg-zinc-950/50 ${plan.color}`}
                    >
                      <plan.icon className="w-8 h-8" />
                    </div>
                    {isCurrent && (
                      <span className="px-3 py-1 rounded-full bg-primary text-black text-xs font-bold uppercase tracking-wider">
                        Aktif
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-3xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">
                      /bulan
                    </span>
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
                    className={`w-full font-bold ${
                      isCurrent
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer hover:bg-zinc-600"
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
      </div>

      {/* Modal Invoice - Tampilan WEB (Tema Gelap) */}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowInvoice(false)}
                  >
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
                        {formData.orderId || "PENDING"}
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
                        {new Date().toLocaleDateString("id-ID", {
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
                      <p className="font-semibold text-white truncate">
                        {formData.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Email</p>
                      <p className="font-semibold text-white truncate">
                        {formData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Nomor HP</p>
                      <p className="font-semibold text-white">
                        {formData.phone}
                      </p>
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

          {/* TAMPILAN CETAK SAJA (Gaya Struk) */}
          <div className="hidden printable-area">
            <div className="w-[380px] border border-gray-200 bg-white text-black p-8 font-mono text-sm shadow-sm relative overflow-hidden">
              {/* Hiasan Atas */}
              <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)] opacity-10"></div>

              {/* Header */}
              <div className="text-center space-y-2 pb-6 border-b-2 border-dashed border-gray-300">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-black text-white rounded-lg">
                    <DumbbellIcon className="w-6 h-6" />
                  </div>
                </div>
                <h2 className="text-xl font-black uppercase tracking-widest text-black">
                  UNP GYM RECEIPT
                </h2>
                <p className="text-xs text-gray-500">
                  Jalan Prof. Dr. Hamka, Air Tawar
                  <br />
                  Padang, Sumatera Barat
                </p>
              </div>

              {/* Meta */}
              <div className="flex justify-between text-xs text-gray-500 py-3">
                <span>{new Date().toLocaleDateString("id-ID")}</span>
                <span>
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Barang/Item */}
              <div className="py-4 space-y-3">
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-xs uppercase">
                    No. Order
                  </span>
                  <span className="font-bold tracking-widest">
                    {formData.orderId || "GYM-REF"}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <span className="text-gray-500 text-xs uppercase">
                    Member
                  </span>
                  <span className="font-bold uppercase">
                    {formData.fullName}
                  </span>
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
                <p className="text-xs text-gray-400">
                  Terima kasih telah bergabung dengan kami!
                </p>
              </div>

              {/* Garis Potong */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pb-2 opacity-30">
                {"- - - - - - - - - - - - - - - - - - - - - - - - -"
                  .split("")
                  .map((c, i) => (
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
          <AlertDialogTitle className="sr-only">
            Email Terkirim
          </AlertDialogTitle>
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
                <CardTitle>
                  {isEditing ? "Edit Profil" : "Lengkapi Data Diri"}
                </CardTitle>
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
                <div
                  className={`grid grid-cols-1 ${
                    !isEditing ? "md:grid-cols-2" : ""
                  } gap-6`}
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-zinc-300">
                      Nama Lengkap
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Masukkan nama lengkap"
                      required
                      value={formData.fullName}
                      onChange={ubahInput}
                      className="bg-zinc-900 border-zinc-700 focus-visible:ring-primary"
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
                      className="bg-zinc-900 border-zinc-700 focus-visible:ring-primary"
                    />
                  </div>

                  {!isEditing && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-zinc-300">
                          Nomor HP
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          required
                          value={formData.phone}
                          onChange={ubahInput}
                          className="bg-zinc-900 border-zinc-700 focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-zinc-300">
                          Jenis Kelamin
                        </Label>
                        <Select
                          onValueChange={(val) => ubahPilihan("gender", val)}
                          required
                          defaultValue={formData.gender}
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
                        <Label htmlFor="dob" className="text-zinc-300">
                          Tanggal Lahir
                        </Label>
                        <Input
                          id="dob"
                          type="date"
                          required
                          value={formData.dob}
                          onChange={ubahInput}
                          className="bg-zinc-900 border-zinc-700 focus-visible:ring-primary [color-scheme:dark]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal" className="text-zinc-300">
                          Tujuan Latihan
                        </Label>
                        <Select
                          onValueChange={(val) => ubahPilihan("goal", val)}
                          required
                          defaultValue={formData.goal}
                        >
                          <SelectTrigger className="bg-zinc-900 border-zinc-700 focus:ring-primary">
                            <SelectValue placeholder="Pilih tujuan latihan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Menurunkan Berat Badan">
                              Menurunkan Berat Badan
                            </SelectItem>
                            <SelectItem value="Membentuk Otot">
                              Membentuk Otot
                            </SelectItem>
                            <SelectItem value="Meningkatkan Stamina">
                              Meningkatkan Stamina
                            </SelectItem>
                            <SelectItem value="Kesehatan Umum">
                              Kesehatan Umum
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-zinc-300">
                      Alamat Domisili
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Alamat lengkap domisili saat ini"
                      required
                      value={formData.address}
                      onChange={ubahInput}
                      className="bg-zinc-900 border-zinc-700 focus-visible:ring-primary min-h-[80px]"
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
      {showSuccess && (activePlan || isEditing) && (
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
                        {plans.find((p) => p.id === activePlan)?.name}
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
                      <span className="text-white font-semibold">
                        {formData.fullName}
                      </span>
                      , perjalanan kebugaran Anda dimulai sekarang!
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
