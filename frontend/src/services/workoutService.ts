const API_URL = "http://localhost:8000/api/workouts";

export interface Workout {
  _id: string;
  title: string;
  level: string;
  calories_burned: number;
  description: string;
  category_id: {
    _id: string;
    name: string;
  };
}

export const getWorkouts = async (
  category?: string,
  level?: string,
  search?: string
): Promise<Workout[]> => {
  let query = [];

  if (category) query.push(`category=${category}`);
  if (level) query.push(`level=${level}`);
  if (search) query.push(`search=${search}`);

  const res = await fetch(`${API_URL}?${query.join("&")}`);
  return res.json();
};
export const createWorkout = async (data: any) => {
  const res = await fetch("http://localhost:8000/api/workouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create workout");

  return res.json();
};
export const getWorkoutById = async (id: string) => {
  const res = await fetch(`http://localhost:8000/api/workouts/${id}`);
  return res.json();
};
export const updateWorkout = async (id: string, data: any) => {
  const res = await fetch(`http://localhost:8000/api/workouts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteWorkout = async (id: string) => {
  const res = await fetch(`/api/workouts/${id}`, {
    method: "DELETE",
  });
  return res.json();
};