import { useCallback, useEffect, useState } from "react";
import { getWorkouts } from "../../services/workoutService";
import type { Workout } from "../../services/workoutService";
import { getCategories } from "../../services/categoryService";
import type { Category } from "../../services/categoryService";
import AdminLayout from "../../components/AdminLayout";
import toast, { Toaster } from "react-hot-toast";

const API_URL =
  (import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEV || "http://localhost:8000"
    : import.meta.env.VITE_API_URL || "https://healthmate-y9vt.onrender.com");

type PlanExercise = {
  title: string;
  video_url: string;
  duration_sec: number;
  order: number;
};

type PlanDay = {
  day_number: number;
  day_title: string;
  exercises: PlanExercise[];
};

type WorkoutForm = {
  title: string;
  cover_image: string;
  category_id: string;
  level: string;
  access_tier: "free" | "premium";
  calories_burned: number;
  description: string;
  program_days: PlanDay[];
};

const emptyExercise = (order: number): PlanExercise => ({
  title: "",
  video_url: "",
  duration_sec: 60,
  order,
});

const emptyDay = (day: number): PlanDay => ({
  day_number: day,
  day_title: `Day ${day}`,
  exercises: [emptyExercise(1)],
});

const initialForm = (): WorkoutForm => ({
  title: "",
  cover_image: "",
  category_id: "",
  level: "beginner",
  access_tier: "free",
  calories_burned: 0,
  description: "",
  program_days: [emptyDay(1)],
});

const normalizeProgramDays = (days: PlanDay[]) =>
  days
    .map((day, dayIndex) => ({
      day_number: dayIndex + 1,
      day_title: day.day_title.trim() || `Day ${dayIndex + 1}`,
      exercises: (day.exercises || [])
        .map((ex, exIndex) => ({
          title: ex.title.trim(),
          video_url: ex.video_url.trim(),
          duration_sec: Number(ex.duration_sec) || 60,
          order: exIndex + 1,
        }))
        .filter((ex) => ex.title.length > 0),
    }));

const getProgramDaysFromWorkout = (workout: Workout): PlanDay[] => {
  if (Array.isArray(workout.program_days) && workout.program_days.length > 0) {
    return workout.program_days.map((day, dayIndex) => ({
      day_number: Number(day.day_number) || dayIndex + 1,
      day_title: day.day_title || `Day ${dayIndex + 1}`,
      exercises:
        Array.isArray(day.exercises) && day.exercises.length > 0
          ? day.exercises.map((ex, exIndex) => ({
              title: ex.title || "",
              video_url: ex.video_url || "",
              duration_sec: Number(ex.duration_sec) || 60,
              order: Number(ex.order) || exIndex + 1,
            }))
          : [emptyExercise(1)],
    }));
  }

  if (Array.isArray(workout.exercises) && workout.exercises.length > 0) {
    return [
      {
        day_number: 1,
        day_title: "Day 1",
        exercises: workout.exercises.map((ex, exIndex) => ({
          title: ex.title || "",
          video_url: ex.video_url || "",
          duration_sec: Number(ex.duration_sec) || 60,
          order: Number(ex.order) || exIndex + 1,
        })),
      },
    ];
  }

  return [emptyDay(1)];
};

const getCategoryName = (categoryId: Workout["category_id"]) =>
  typeof categoryId === "object" ? categoryId?.name || "N/A" : "N/A";

const getCategoryId = (categoryId: Workout["category_id"]) =>
  typeof categoryId === "object" ? categoryId?._id || "" : categoryId || "";

const getDayCount = (workout: Workout) =>
  Array.isArray(workout.program_days) && workout.program_days.length > 0
    ? workout.program_days.length
    : 1;

const getExerciseCount = (workout: Workout) => {
  if (Array.isArray(workout.program_days) && workout.program_days.length > 0) {
    return workout.program_days.reduce(
      (sum, day) => sum + (Array.isArray(day.exercises) ? day.exercises.length : 0),
      0,
    );
  }
  return Array.isArray(workout.exercises) ? workout.exercises.length : 0;
};

const AdminWorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<WorkoutForm>(initialForm());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [workoutsData, categoriesData] = await Promise.all([
        getWorkouts({ search, level, categoryId: categoryFilter }),
        getCategories(),
      ]);
      setWorkouts(Array.isArray(workoutsData) ? workoutsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      toast.error("Cannot load data.");
    } finally {
      setLoading(false);
    }
  }, [search, level, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDay = () => {
    setForm((prev) => ({
      ...prev,
      program_days: [...prev.program_days, emptyDay(prev.program_days.length + 1)],
    }));
  };

  const removeDay = (dayIndex: number) => {
    setForm((prev) => {
      if (prev.program_days.length <= 1) return prev;
      const nextDays = prev.program_days
        .filter((_, idx) => idx !== dayIndex)
        .map((day, idx) => ({
          ...day,
          day_number: idx + 1,
          day_title: day.day_title || `Day ${idx + 1}`,
          exercises: day.exercises.map((ex, exIndex) => ({ ...ex, order: exIndex + 1 })),
        }));
      return { ...prev, program_days: nextDays };
    });
  };

  const addExercise = (dayIndex: number) => {
    setForm((prev) => {
      const days = [...prev.program_days];
      const current = days[dayIndex].exercises;
      days[dayIndex] = {
        ...days[dayIndex],
        exercises: [...current, emptyExercise(current.length + 1)],
      };
      return { ...prev, program_days: days };
    });
  };

  const updateExercise = (
    dayIndex: number,
    exIndex: number,
    key: keyof PlanExercise,
    value: string | number,
  ) => {
    setForm((prev) => {
      const days = [...prev.program_days];
      const exercises = [...days[dayIndex].exercises];
      exercises[exIndex] = { ...exercises[exIndex], [key]: value };
      days[dayIndex] = { ...days[dayIndex], exercises };
      return { ...prev, program_days: days };
    });
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    setForm((prev) => {
      const days = [...prev.program_days];
      const nextExercises = days[dayIndex].exercises.filter((_, idx) => idx !== exIndex);
      days[dayIndex] = {
        ...days[dayIndex],
        exercises:
          nextExercises.length > 0
            ? nextExercises.map((ex, idx) => ({ ...ex, order: idx + 1 }))
            : [emptyExercise(1)],
      };
      return { ...prev, program_days: days };
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm());
    setShowModal(true);
  };

  const openEdit = (workout: Workout) => {
    setEditingId(workout._id);
    setForm({
      title: workout.title || "",
      cover_image: workout.cover_image || "",
      category_id: getCategoryId(workout.category_id),
      level: workout.level || "beginner",
      access_tier: workout.access_tier || "free",
      calories_burned: Number(workout.calories_burned) || 0,
      description: workout.description || "",
      program_days: getProgramDaysFromWorkout(workout),
    });
    setShowModal(true);
  };

  const saveWorkout = async () => {
    if (!form.title.trim() || !form.cover_image.trim() || !form.category_id) {
      toast.error("Please enter roadmap title, cover image, and category.");
      return;
    }

    const days = normalizeProgramDays(form.program_days);
    if (days.length === 0) {
      toast.error("At least one day must include valid exercises.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingId ? `${API_URL}/api/workouts/${editingId}` : `${API_URL}/api/workouts`;
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        cover_image: form.cover_image.trim(),
        access_tier: form.access_tier || "free",
        program_days: days,
        exercises: days[0]?.exercises || [],
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to save roadmap.");
        return;
      }

      toast.success(editingId ? "Roadmap updated successfully." : "Roadmap created successfully.");
      setShowModal(false);
      setForm(initialForm());
      setEditingId(null);
      await fetchData();
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkout = async (id: string) => {
    if (!window.confirm("Delete this roadmap?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/workouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Delete failed.");
        return;
      }
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
      toast.success("Roadmap deleted.");
    } catch (error) {
      toast.error("Network error.");
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto w-full pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Workout Roadmap</h1>
            <p className="text-slate-500 text-sm mt-1">
              Create multi-day workout roadmaps instead of a single exercise.
            </p>
          </div>
          <button onClick={openCreate} className="bg-primary text-slate-900 font-bold px-4 py-2 rounded-lg">
            Add roadmap
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by roadmap name..."
            className="border rounded p-2 bg-transparent"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border rounded p-2 bg-transparent"
          >
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded p-2 bg-transparent"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="p-3 text-left">Roadmap</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Level</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Days / Exercises</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={6}>Loading...</td></tr>
              ) : workouts.length === 0 ? (
                <tr><td className="p-4" colSpan={6}>No data yet.</td></tr>
              ) : (
                workouts.map((workout) => (
                  <tr key={workout._id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3 font-semibold">{workout.title}</td>
                    <td className="p-3">{getCategoryName(workout.category_id)}</td>
                    <td className="p-3">{workout.level}</td>
                    <td className="p-3">
                      <span className={workout.access_tier === "premium" ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                        {workout.access_tier === "premium" ? "Paid" : "Free"}
                      </span>
                    </td>
                    <td className="p-3">{getDayCount(workout)} days / {getExerciseCount(workout)} exercises</td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => openEdit(workout)} className="text-blue-500">Edit</button>
                      <button onClick={() => deleteWorkout(workout._id)} className="text-red-500">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingId ? "Edit roadmap" : "Add roadmap"}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Roadmap title" className="border rounded p-2 bg-transparent" />
                <input value={form.cover_image} onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))} placeholder="Cover image URL" className="border rounded p-2 bg-transparent" />
                <select value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))} className="border rounded p-2 bg-transparent">
                  <option value="">Select category</option>
                  {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} className="border rounded p-2 bg-transparent">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <select value={form.access_tier} onChange={(e) => setForm((p) => ({ ...p, access_tier: e.target.value as "free" | "premium" }))} className="border rounded p-2 bg-transparent">
                  <option value="free">Free workout</option>
                  <option value="premium">Paid workout</option>
                </select>
                <input type="number" value={form.calories_burned} onChange={(e) => setForm((p) => ({ ...p, calories_burned: Number(e.target.value) }))} placeholder="Kcal/day" className="border rounded p-2 bg-transparent" />
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="border rounded p-2 bg-transparent" />
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Daily roadmap structure</h3>
                  <button onClick={addDay} className="text-primary font-semibold">+ Add day</button>
                </div>

                {form.program_days.map((day, dayIndex) => (
                  <div key={dayIndex} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Day {day.day_number}</span>
                      <input
                        value={day.day_title}
                        onChange={(e) =>
                          setForm((prev) => {
                            const days = [...prev.program_days];
                            days[dayIndex] = { ...days[dayIndex], day_title: e.target.value };
                            return { ...prev, program_days: days };
                          })
                        }
                        className="border rounded p-1 flex-1 bg-transparent"
                      />
                      <button onClick={() => removeDay(dayIndex)} className="text-red-500">Delete day</button>
                    </div>

                    <div className="space-y-2">
                      {day.exercises.map((exercise, exIndex) => (
                        <div key={exIndex} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                          <input
                            value={exercise.title}
                            onChange={(e) => updateExercise(dayIndex, exIndex, "title", e.target.value)}
                            placeholder="Exercise name"
                            className="border rounded p-2 md:col-span-4 bg-transparent"
                          />
                          <input
                            value={exercise.video_url}
                            onChange={(e) => updateExercise(dayIndex, exIndex, "video_url", e.target.value)}
                            placeholder="Link video"
                            className="border rounded p-2 md:col-span-5 bg-transparent"
                          />
                          <input
                            type="number"
                            value={exercise.duration_sec}
                            onChange={(e) =>
                              updateExercise(dayIndex, exIndex, "duration_sec", Number(e.target.value))
                            }
                            className="border rounded p-2 md:col-span-2 bg-transparent"
                          />
                          <button onClick={() => removeExercise(dayIndex, exIndex)} className="text-red-500 md:col-span-1">
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => addExercise(dayIndex)} className="text-primary text-sm font-semibold">
                      + Add exercise
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button onClick={saveWorkout} disabled={saving} className="px-4 py-2 rounded bg-primary text-slate-900 font-bold">
                  {saving ? "Saving..." : "Save roadmap"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWorkoutsPage;
