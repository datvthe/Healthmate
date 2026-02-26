import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getWorkouts, createWorkout } from "../services/workoutService";
import type { Workout } from "../services/workoutService";
import { getCategories } from "../services/categoryService";
import type { Category } from "../services/categoryService";
import { useNavigate } from "react-router-dom";

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    calories_burned: 0,
    category_id: "",
  });

  const [exercises, setExercises] = useState([
    {
      title: "",
      video_url: "",
      duration_sec: 0,
      order: 1,
    },
  ]);

  const fetchData = async () => {
    setLoading(true);
    const data = await getWorkouts(undefined, level, search);
    setWorkouts(data);
    setLoading(false);
  };

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    fetchData();
    loadCategories();
  }, [level]);

  const handleCreate = async () => {
    await createWorkout({
      ...form,
      exercises,
    });

    setShowModal(false);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 px-10 py-10 flex flex-col gap-10">
        {/* HEADER */}
        <div className="flex justify-between">
          <h1 className="text-4xl font-black">
            Exercise Library & Programs
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="h-12 px-6 bg-slate-900 text-white rounded-lg font-bold"
          >
            + Create Custom Workout
          </button>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workouts.map((w) => (
              <div
                key={w._id}
                onClick={() => navigate(`/workouts/${w._id}`)}
                className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <h3 className="font-bold">{w.title}</h3>
                <p className="text-sm text-slate-500">{w.description}</p>
                <p className="text-sm mt-2">
                  🔥 {w.calories_burned} kcal
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL giữ nguyên hoàn toàn */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center overflow-auto">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl w-[500px] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold">Create Workout</h2>

            <input
              placeholder="Title"
              className="border p-2 rounded"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              rows={3}
              className="border p-2 rounded min-h-[80px] resize-none"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <select
              className="border p-2 rounded"
              value={form.level}
              onChange={(e) =>
                setForm({ ...form, level: e.target.value })
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <input
              type="number"
              placeholder="Calories Burned"
              className="border p-2 rounded"
              value={form.calories_burned}
              onChange={(e) =>
                setForm({
                  ...form,
                  calories_burned: Number(e.target.value),
                })
              }
            />

            <select
              className="border p-2 rounded"
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Exercises giữ nguyên như bạn đang có */}

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary rounded font-bold"
              >
                Create
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;