"use server";

// Interface untuk data Latihan (Exercise)
export interface Latihan {
  idLatihan: string;
  nama: string;
  ototTarget: string[];
  peralatan: string[];
  bagianTubuh: string[];
  urlGambar: string;
  kataKunci: string[];
  ototSekunder: string[];
  tipeLatihan: string;
}

// Interface respon dari API ExerciseDB
interface ResponExerciseDB {
  success: boolean;
  data: {
    exerciseId: string;
    name: string;
    targetMuscles: string[];
    equipment: string[];
    bodyParts: string[];
    imageUrl: string;
    keywords: string[];
    secondaryMuscles: string[];
    exerciseType: string;
  }[];
}

// Fungsi untuk mendapatkan daftar latihan berdasarkan pencarian dan filter
export async function getLatihan(pencarian: string, filterBagianTubuh: string) {
  try {
    const baseUrl = "https://v2.exercisedb.dev/api/v1/exercises";
    const params = new URLSearchParams();

    params.append("limit", "500");
    if (pencarian) params.append("name", pencarian);
    if (filterBagianTubuh && filterBagianTubuh !== "All")
      params.append("bodyParts", filterBagianTubuh);

    const response = await fetch(`${baseUrl}?${params.toString()}`, {});

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.statusText}`);
    }

    const json = (await response.json()) as ResponExerciseDB;

    if (!json.success || !json.data) {
      return { data: [] };
    }

    // Mapping ulang data dari API
    const dataLatihan: Latihan[] = json.data.map((item) => ({
      idLatihan: item.exerciseId,
      nama: item.name,
      ototTarget: item.targetMuscles,
      peralatan: item.equipment,
      bagianTubuh: item.bodyParts,
      urlGambar: item.imageUrl,
      kataKunci: item.keywords,
      ototSekunder: item.secondaryMuscles,
      tipeLatihan: item.exerciseType,
    }));

    return { data: dataLatihan };
  } catch (err) {
    console.error("Exercise Action Error:", err);
    return { error: "Gagal mengambil data latihan dari ExerciseDB." };
  }
}

// Interface untuk Detail Latihan yang lebih lengkap
export interface DetailLatihan {
  idLatihan: string;
  nama: string;
  urlGambar: string;
  peralatan: string[];
  bagianTubuh: string[];
  tipeLatihan: string;
  ototTarget: string[];
  ototSekunder: string[];
  urlVideo: string;
  kataKunci: string[];
  ringkasan: string;
  instruksi: string[];
  tipsLatihan: string[];
  variasi: string[];
  idLatihanTerkait: string[];
}

// Interface respon detail dari API ExerciseDB
interface ResponDetailExerciseDB {
  success: boolean;
  data: {
    exerciseId: string;
    name: string;
    imageUrl: string;
    equipments: string[];
    bodyParts: string[];
    exerciseType: string;
    targetMuscles: string[];
    secondaryMuscles: string[];
    videoUrl: string;
    keywords: string[];
    overview: string;
    instructions: string[];
    exerciseTips: string[];
    variations: string[];
    relatedExerciseIds: string[];
  };
}

// Fungsi untuk mendapatkan detail latihan berdasarkan ID
export async function getDetailLatihan(id: string) {
  try {
    const baseUrl = `https://v2.exercisedb.dev/api/v1/exercises/${id}`;

    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.statusText}`);
    }

    const json = (await response.json()) as ResponDetailExerciseDB;

    if (!json.success || !json.data) {
      return { error: "Latihan tidak ditemukan." };
    }

    const item = json.data;

    // Mapping ulang data detail
    const detailLatihan: DetailLatihan = {
      idLatihan: item.exerciseId,
      nama: item.name,
      urlGambar: item.imageUrl,
      peralatan: item.equipments,
      bagianTubuh: item.bodyParts,
      tipeLatihan: item.exerciseType,
      ototTarget: item.targetMuscles,
      ototSekunder: item.secondaryMuscles,
      urlVideo: item.videoUrl,
      kataKunci: item.keywords,
      ringkasan: item.overview,
      instruksi: item.instructions,
      tipsLatihan: item.exerciseTips,
      variasi: item.variations,
      idLatihanTerkait: item.relatedExerciseIds,
    };

    return { data: detailLatihan };
  } catch (err) {
    console.error("Exercise Detail Error:", err);
    return { error: "Gagal mengambil detail latihan." };
  }
}
