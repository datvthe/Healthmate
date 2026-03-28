const BASE_URL =
  (import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEV || "http://localhost:8000"
    : import.meta.env.VITE_API_URL || "https://healthmate-y9vt.onrender.com");

const API_URL = `${BASE_URL}/api/workouts`;
const USER_WORKOUT_API = `${BASE_URL}/api/user/user-workouts`;
const WORKOUT_LOG_API = `${BASE_URL}/api/workout-logs`;
const USER_API = `${BASE_URL}/api/users`;
//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

export interface WorkoutExercise {
  title: string;
  video_url: string;
  duration_sec: number;
  order?: number;
}

export interface WorkoutProgramDay {
  day_number: number;
  day_title: string;
  exercises: WorkoutExercise[];
}

export interface Workout {
  _id: string;
  title: string;
  name?: string;
  level: string;
  access_tier?: "free" | "premium";
  is_locked?: boolean;
  calories_burned: number;
  duration?: number;
  estimatedCalories?: number;
  description: string;
  cover_image?: string;
  exercises?: WorkoutExercise[];
  program_days?: WorkoutProgramDay[];
  category_id: {
    _id: string;
    name: string;
  } | string;
}

export interface WorkoutFilterParams {
  category?: string;
  categoryId?: string;
  level?: string;
  search?: string;
  accessTier?: "free" | "premium";
}

//////////////////////////////////////////////////////////////
// BASIC WORKOUT APIs
//////////////////////////////////////////////////////////////

export const getWorkouts = async (
  paramsOrCategory?: WorkoutFilterParams | string,
  levelArg?: string,
  searchArg?: string,
): Promise<Workout[]> => {
  const query: string[] = [];
  let category = "";
  let level = "";
  let search = "";

  if (typeof paramsOrCategory === "object" && paramsOrCategory !== null) {
    category = paramsOrCategory.categoryId || paramsOrCategory.category || "";
    level = paramsOrCategory.level || "";
    search = paramsOrCategory.search || "";
    if (paramsOrCategory.accessTier) {
      query.push(`access_tier=${encodeURIComponent(paramsOrCategory.accessTier)}`);
    }
  } else {
    category = paramsOrCategory || "";
    level = levelArg || "";
    search = searchArg || "";
  }

  if (category) query.push(`category=${encodeURIComponent(category)}`);
  if (level) query.push(`level=${encodeURIComponent(level)}`);
  if (search) query.push(`search=${encodeURIComponent(search)}`);

  const res = await fetch(`${API_URL}?${query.join("&")}`);
  return res.json();
};

export const createWorkout = async (data: any) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create workout");
  return res.json();
};

export const getWorkoutById = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
};

export const updateWorkout = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteWorkout = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

//////////////////////////////////////////////////////////////
// USER WORKOUT PLAN
//////////////////////////////////////////////////////////////

export const getWorkoutLibrary = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(USER_WORKOUT_API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const addWorkoutPlan = async (
  workout_id: string,
  planned_duration: number = 30
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(USER_WORKOUT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      workout_id,
      planned_duration,
    }),
  });

  return res.json();
};

export const getMyWorkoutPlan = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${USER_WORKOUT_API}/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return [];
    }

    if (!res.ok) throw new Error(`HTTP error!`);

    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

export const startWorkout = async (id: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${USER_WORKOUT_API}/start/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

export const finishWorkout = async (id: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${USER_WORKOUT_API}/finish/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

export const removeWorkoutPlan = async (id: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${USER_WORKOUT_API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
};

//////////////////////////////////////////////////////////////
// WORKOUT LOGS
//////////////////////////////////////////////////////////////

export const getMyWorkoutLogs = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${WORKOUT_LOG_API}/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return [];
    }

    if (!res.ok) throw new Error(`HTTP error!`);

    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

//////////////////////////////////////////////////////////////
// DAILY ROUTINE
//////////////////////////////////////////////////////////////

export const getDailyRoutine = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${USER_API}/me/daily-routine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`HTTP error!`);

    return await res.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

export const updateDailyRoutine = async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${USER_API}/me/daily-routine`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

//////////////////////////////////////////////////////////////
// 🤖 AI RECOMMEND (NEW)
//////////////////////////////////////////////////////////////




export const getAIWorkoutRecommend = async (
  goal: any,
  logs: any[],
  library: Workout[]
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/ai/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 👈 FIX Ở ĐÂY
    },
    body: JSON.stringify({
      goal,
      logs,
      library,
    }),
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return [];
  }

  return res.json();
};
