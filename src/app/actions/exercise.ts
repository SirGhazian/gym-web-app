"use server";

export interface Exercise {
  exerciseId: string;
  name: string;
  targetMuscles: string[];
  equipment: string[];
  bodyParts: string[];
  imageUrl: string;
  keywords: string[];
  secondaryMuscles: string[];
  exerciseType: string;
}

interface ExerciseDBResponse {
  success: boolean;
  data: Exercise[];
}

export async function getExercises(query: string, filterBodyPart: string) {
  try {
    const baseUrl = "https://v2.exercisedb.dev/api/v1/exercises";
    const params = new URLSearchParams();

    params.append("limit", "500");
    if (query) params.append("name", query);
    if (filterBodyPart && filterBodyPart !== "All") params.append("bodyParts", filterBodyPart);

    const response = await fetch(`${baseUrl}?${params.toString()}`, {});

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.statusText}`);
    }

    const json = (await response.json()) as ExerciseDBResponse;

    if (!json.success || !json.data) {
      return { data: [] };
    }

    return { data: json.data };
  } catch (err) {
    console.error("Exercise Action Error:", err);
    return { error: "Failed to fetch exercises from ExerciseDB." };
  }
}

export interface ExerciseDetail {
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
}

interface ExerciseDetailResponse {
  success: boolean;
  data: ExerciseDetail;
}

export async function getExerciseDetail(id: string) {
  try {
    const baseUrl = `https://v2.exercisedb.dev/api/v1/exercises/${id}`;

    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.statusText}`);
    }

    const json = (await response.json()) as ExerciseDetailResponse;

    if (!json.success || !json.data) {
      return { error: "Exercise not found." };
    }

    return { data: json.data };
  } catch (err) {
    console.error("Exercise Detail Error:", err);
    return { error: "Failed to fetch exercise details." };
  }
}
