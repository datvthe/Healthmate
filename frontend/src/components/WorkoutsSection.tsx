import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkouts, createWorkout } from '../services/workoutService';
import type { Workout } from '../services/workoutService';
import { getCategories } from '../services/categoryService';
import type { Category } from '../services/categoryService';

interface WorkoutsSectionProps {
  onBack: () => void;
}

const WorkoutsSection: React.FC<WorkoutsSectionProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: "",
    cover_image: "",
    category_id: "",
    level: "beginner",
    calories_burned: 0,
    description: "",
    exercises: [] as any[],
  });

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const data = await getWorkouts(categoryId, level, search);
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    loadCategories();
  }, [level, categoryId, search]);

  const clearFilters = () => {
    setLevel("");
    setCategoryId("");
    setSearch("");
  };

  const handleCreateWorkout = async () => {
    try {
      await createWorkout(newWorkout);
      setShowModal(false);
      setNewWorkout({
        title: "",
        cover_image: "",
        category_id: "",
        level: "beginner",
        calories_burned: 0,
        description: "",
        exercises: [],
      });
      fetchWorkouts();
    } catch (error) {
      alert("Create workout failed");
    }
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-text-light text-3xl font-bold tracking-tight">Exercise Library & Programs</h2>
          <p className="text-text-dim text-sm mt-1">Explore workouts curated for your fitness goals</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="h-12 px-6 bg-primary text-white rounded-xl font-semibold shadow hover:bg-primary-dark transition"
          >
            + Create Custom Workout
          </button>
          <button
            onClick={onBack}
            className="h-12 px-6 bg-surface-elevated text-text-light rounded-xl font-semibold shadow hover:bg-surface-darker transition border border-border-color"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl shadow flex flex-wrap items-center gap-4 border border-border-color">
        <span className="font-semibold text-text-dim">FILTERS:</span>
        <input
          type="text"
          placeholder="Search workout..."
          className="px-4 py-2 border rounded-lg text-sm bg-surface-dark border-border-color text-text-light placeholder-text-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg text-sm bg-surface-dark border-border-color text-text-light"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          className="px-4 py-2 border rounded-lg text-sm bg-surface-dark border-border-color text-text-light"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={clearFilters}
          className="ml-auto text-sm text-text-dim hover:text-primary transition"
        >
          Clear All
        </button>
      </div>

      {/* Workouts Grid */}
      {loading ? (
        <div className="text-center py-20 text-text-dim">Loading...</div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-20 text-text-muted">No workouts found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workouts.map((w) => (
            <div
              key={w._id}
              onClick={() => navigate(`/workouts/${w._id}`)}
              className="bg-surface-elevated rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition duration-300 border border-border-color"
            >
              {/* Cover Image */}
              <div className="relative">
                <img
                  src={(w as any).cover_image || "https://via.placeholder.com/400x250"}
                  alt={w.title}
                  className="w-full h-52 object-cover"
                />
                {/* Badge */}
                {w.level && (
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-md uppercase ${getLevelBadgeStyle(w.level)}`}>
                    {w.level}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg leading-tight text-text-light">
                    {w.title}
                  </h3>
                  <span className="text-xs bg-surface-darker text-text-dim px-2 py-1 rounded-md capitalize border border-border-color">
                    {w.level}
                  </span>
                </div>

                <p className="text-sm text-text-dim mt-2 line-clamp-2">
                  {w.description}
                </p>

                {/* Footer Tags */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                    🔥 {w.calories_burned} kcal
                  </span>
                  {w.category_id && (
                    <span className="text-xs bg-surface-darker text-text-dim px-3 py-1 rounded-full border border-border-color">
                      {typeof w.category_id === "object" ? (w.category_id as any).name : "Category"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-elevated w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-xl border border-border-color">
            <h2 className="text-2xl font-bold mb-6 text-text-light">Create Workout</h2>
            <div className="flex flex-col gap-4">
              <input
                placeholder="Title"
                className="border p-3 rounded-lg bg-surface-dark border-border-color text-text-light placeholder-text-muted"
                value={newWorkout.title}
                onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
              />
              <input
                placeholder="Cover Image URL"
                className="border p-3 rounded-lg bg-surface-dark border-border-color text-text-light placeholder-text-muted"
                value={newWorkout.cover_image}
                onChange={(e) => setNewWorkout({ ...newWorkout, cover_image: e.target.value })}
              />
              <select
                className="border p-3 rounded-lg bg-surface-dark border-border-color text-text-light"
                value={newWorkout.category_id}
                onChange={(e) => setNewWorkout({ ...newWorkout, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                className="border p-3 rounded-lg bg-surface-dark border-border-color text-text-light"
                value={newWorkout.level}
                onChange={(e) => setNewWorkout({ ...newWorkout, level: e.target.value as any })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input
                type="number"
                placeholder="Calories Burned"
                className="border p-3 rounded-lg bg-surface-dark border-border-color text-text-light placeholder-text-muted"
                value={newWorkout.calories_burned}
                onChange={(e) => setNewWorkout({ ...newWorkout, calories_burned: parseInt(e.target.value) || 0 })}
              />
              <textarea
                placeholder="Description"
                rows={4}
                className="border p-3 rounded-lg bg-surface-dark border-border-color text-text-light placeholder-text-muted"
                value={newWorkout.description}
                onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-border-color rounded-lg text-text-dim hover:bg-surface-darker transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkout}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Create Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutsSection;
