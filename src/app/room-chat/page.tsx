"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, LogOut, MessageSquare, Hash, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Definisikan URL Socket
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

interface Message {
  id: string;
  text: string;
  userId: string;
  authorName: string;
  createdAt: string;
}

interface RoomData {
  id: string;
  roomNumber: string;
}

let socket: Socket;

export default function RoomChatPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"input" | "chat">("input");
  const [roomNumber, setRoomNumber] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeRooms, setActiveRooms] = useState<RoomData[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Alihkan jika belum login
  useEffect(() => {
    // Tunggu sebentar untuk memastikan status auth dimuat
    const timer = setTimeout(() => {
      if (!user && !localStorage.getItem("gym_user")) {
        router.push("/login");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inisialisasi koneksi Socket
  useEffect(() => {
    if (!user) return;

    socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Connected to socket server");
      // Minta room aktif saat terkoneksi
      socket.emit("get_active_rooms");
    });

    socket.on("active_rooms", (rooms: RoomData[]) => {
      setActiveRooms(rooms);
    });

    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("receive_history", (history: Message[]) => {
      setMessages(history);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const masukRoom = (e?: React.FormEvent, roomNum?: string) => {
    if (e) e.preventDefault();
    const finalRoomNumber = roomNum || roomNumber;

    if (!finalRoomNumber.trim()) return;
    if (!user) return;

    // Update state jika berasal dari klik
    if (roomNum) setRoomNumber(roomNum);

    // Gabung Room
    socket.emit("join_room", { room: finalRoomNumber, username: user.username });

    // Hapus pesan sebelumnya sampai history diterima
    setMessages([]);
    setStep("chat");
  };

  const kirimPesan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const now = new Date();
    // const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Kirim Pesan
    socket.emit("send_message", {
      room: roomNumber,
      username: user.username,
      author: user.name,
      message: inputText,
      time: now.toISOString(),
    });

    setInputText("");
  };

  const keluarRoom = () => {
    setStep("input");
    setMessages([]);
    setRoomNumber("");
  };

  if (!user) {
    return null;
  }

  if (step === "input") {
    return (
      <div className={cn("flex items-center justify-center p-4 min-h-[calc(100svh-65px)]")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Card Masuk Room */}
          <Card className="w-full bg-zinc-900 border-primary/20 h-[450px] flex flex-col justify-center">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Masuk ke Chat Room</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Masukkan nomor room untuk memulai percakapan.
                  </p>
                </div>
              </div>

              <form onSubmit={masukRoom} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Nomor Room</p>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. 306"
                      className="pl-9"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full font-bold" size="lg">
                  Masuk Room
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card Room Aktif */}
          <Card className="w-full bg-zinc-900 border-primary/20 h-[450px] flex flex-col">
            <CardContent className="pt-6 flex flex-col h-full">
              <div className="flex flex-col items-center gap-4 text-center mb-6 shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Hash className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Room Aktif</h2>
                  <p className="text-muted-foreground text-sm">
                    Pilih room yang tersedia untuk bergabung.
                  </p>
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {activeRooms.length > 0 ? (
                  activeRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => masukRoom(undefined, room.roomNumber)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-primary/20 hover:border-primary/50 border border-transparent transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                          <Hash className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Room {room.roomNumber}</span>
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-primary">
                        Gabung &rarr;
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Belum ada room aktif. <br /> Buat room baru di samping!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex overflow-hidden h-[calc(100svh-65px)]")}>
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-zinc-900 border-r border-border flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate w-32">@{user.username}</span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1">
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Room Saat Ini
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Hash className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">{roomNumber}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 gap-2 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Keluar Room
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Keluar Room?</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin meninggalkan ruangan ini? Anda perlu memasukkan nomor
                  ruangan kembali untuk bergabung lagi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={keluarRoom} className="bg-red-500 hover:bg-red-600">
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold">Room {roomNumber}</span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <LogOut className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Room?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave this room?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={keluarRoom}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Pesan */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((msg, index) => {
            // Menambahkan index sebagai fallback key jika id tidak unik sementara
            const isMe = msg.userId === user.username;
            const date = new Date(msg.createdAt);
            const timeDisplay = isNaN(date.getTime())
              ? msg.createdAt // Fallback jika string sudah diformat
              : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={msg.id || index}
                className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-muted-foreground rounded-tl-sm"
                  )}
                >
                  {!isMe && (
                    <p className="text-[10px] font-bold opacity-70 mb-1 text-primary">
                      {msg.authorName}
                    </p>
                  )}
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1 opacity-70",
                      isMe ? "text-primary-foreground/70" : ""
                    )}
                  >
                    {timeDisplay}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background/95 backdrop-blur p-safe-bottom shrink-0">
          <form onSubmit={kirimPesan} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!inputText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
