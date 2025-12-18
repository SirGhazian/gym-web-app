"use client";

import * as React from "react";
import { getExerciseDetail, ExerciseDetail } from "../../actions/exercise";
import { Loader2, ArrowLeft, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExerciseDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [exercise, setExercise] = React.useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const resp = await getExerciseDetail(id);
        console.log("API Response (Detail):", resp);

        if (resp.error) {
          setError(resp.error);
        } else if (resp.data) {
          setExercise(resp.data);
        }
      } catch (err) {
        setError("Gagal mengambil detail latihan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Oops!</h1>
        <p className="text-muted-foreground">{error || "Latihan tidak ditemukan."}</p>
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
        {/* Media & Quick Stats */}
        <div className="space-y-6">
          <div className="relative w-full rounded-2xl overflow-hidden bg-linear-to-br from-white/5 to-white/10 border border-white/10 shadow-2xl group">
            {exercise.videoUrl ? (
              <video
                src={exercise.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                className="w-full h-full object-contain bg-black/50"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Type</p>
                <p className="font-bold text-lg capitalize text-primary">{exercise.exerciseType}</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Body Part
                </p>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {exercise.bodyParts.map((bp) => (
                    <span key={bp} className="text-sm font-semibold capitalize">
                      {bp}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detail */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-primary">
              {exercise.name}
            </h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground capitalize">
              <span>
                Target: <span className="text-foreground">{exercise.targetMuscles.join(", ")}</span>
              </span>
              {exercise.secondaryMuscles.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Secondary:{" "}
                    <span className="text-foreground">{exercise.secondaryMuscles.join(", ")}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
            <p>{exercise.overview}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b border-white/10 pb-2">Instructions</h3>
            <ol className="list-decimal list-outside pl-5 space-y-3 marker:text-primary/50">
              {exercise.instructions.map((step, idx) => (
                <li key={idx} className="pl-2">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {exercise.exerciseTips.length > 0 && (
            <div className="space-y-4 bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
              <h3 className="text-xl font-semibold text-amber-500 flex items-center gap-2">
                Tips & Cautions
              </h3>
              <ul className="space-y-2">
                {exercise.exerciseTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-amber-200/80">
                    <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-500 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exercise.variations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Variations</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.variations.map((v, idx) => (
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
