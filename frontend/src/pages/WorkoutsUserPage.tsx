import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

// --- UI helper types/components borrowed from WorkoutUser.tsx ---

type DbWorkout = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  cover_image?: string;
  category?: string;
  category_id?: { _id?: string; name?: string } | string;
  level?: string;
  difficulty?: string;
  calories_burned?: number;
  calories?: number;
  duration?: number;
};

interface ExerciseRowProps {
    set: string;
    time: string;
    image: string;
    name: string;
    muscle: string;
    detail: string;
    isActive?: boolean;
    checked?: boolean;
}

const ExerciseRow = ({ set, time, image, name, muscle, detail, isActive, checked }: ExerciseRowProps) => (
    <div
        className={`flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border group hover:border-primary/50 transition-colors ${isActive
            ? 'border-slate-200 dark:border-slate-800 border-l-4 border-l-primary'
            : 'border-slate-200 dark:border-slate-800'
            }`}
    >
        <div className="flex flex-col items-center justify-center min-w-[60px] py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{set}</span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">{time}</span>
        </div>
        <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
            <img alt={name} className="h-full w-full object-cover" src={image} />
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{name}</h4>
            <p className="text-sm text-slate-500">{muscle} • {detail}</p>
        </div>
        <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">edit</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">delete</span>
            </button>
        </div>
        {checked ? (
            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">check_circle</span>
        ) : (
            <span className="material-symbols-outlined text-slate-300">radio_button_unchecked</span>
        )}
    </div>
);

interface RecommendCardProps {
    image: string;
    badge: string;
    name: string;
    tags: string[];
}

const RecommendCard = ({ image, badge, name, tags }: RecommendCardProps) => (
    <div className="flex-shrink-0 w-72 group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="aspect-video w-full overflow-hidden bg-slate-200 relative">
            <img className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" src={image} alt={name} />
            <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-slate-900 text-[10px] font-bold rounded">{badge}</div>
        </div>
        <div className="flex flex-col p-4 gap-2">
            <h4 className="font-bold text-base">{name}</h4>
            <div className="flex gap-2">
                {tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">{tag}</span>
                ))}
            </div>
            <button className="mt-2 w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90">
                Add to Routine
            </button>
        </div>
    </div>
);

interface ScheduleDayProps {
    label: string;
    date: number;
    active?: boolean;
    hasDot?: boolean;
}

const ScheduleDay = ({ label, date, active, hasDot }: ScheduleDayProps) => (
    <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${active
                ? 'bg-primary text-slate-900 font-bold'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
        >
            {date}
        </div>
        <div className={`w-1.5 h-1.5 rounded-full ${hasDot ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
    </div>
);

interface ScheduleEventProps {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    time: string;
}

const ScheduleEvent = ({ icon, iconBg, iconColor, title, time }: ScheduleEventProps) => (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer">
        <div className={`${iconBg} p-2 rounded-lg ${iconColor}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex-1">
            <h5 className="text-sm font-bold">{title}</h5>
            <p className="text-[10px] text-slate-500">{time}</p>
        </div>
        <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
    </div>
);

// --- end UI helpers ---

import {
  getWorkoutLibrary,
  addWorkoutPlan,
  getMyWorkoutPlan,
  startWorkout,
  finishWorkout,
  removeWorkoutPlan,
  getMyWorkoutLogs,
} from "../services/workoutService";

import { getUserGoal  } from "../services/goalService";


interface Workout {
  _id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  estimatedCalories: number;
}

const WorkoutsUserPage = () => {
  const navigate = useNavigate();

  const [library, setLibrary] = useState<Workout[]>([]);
  const [myPlan, setMyPlan] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null); // for workout fetch errors
  const [workoutSearch, setWorkoutSearch] = useState("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  // preview modal state
  const [previewWorkoutId, setPreviewWorkoutId] = useState<string | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [goal, setGoal] = useState<any>(null);
  const [goalProgress, setGoalProgress] = useState(0);


const calculateGoalProgress = () => {
  if (!goal || !logs || logs.length === 0) {
    setGoalProgress(0);
    return;
  }

  let progress = 0;

  if (goal.goal_type === "fat_loss") {
    const totalCalories = logs.reduce(
      (sum, l) => sum + (l.calories_burned || 0)
    );

    progress = Math.min((totalCalories / 2000) * 100, 100);
  }

  if (goal.goal_type === "endurance") {
    const totalMinutes = logs.reduce(
      (sum, l) => sum + (l.duration_minutes || 0)
    );

    progress = Math.min((totalMinutes / 300) * 100, 100);
  }

  if (goal.goal_type === "muscle_gain") {
    progress = Math.min((logs.length / 10) * 100, 100);
  }

  setGoalProgress(progress);
};
  // ==========================
  // LOAD DATA
  // ==========================
const loadGoal = async () => {
  try {
    const g = await getUserGoal();
    setGoal(g);
  } catch (err) {
    console.error("Load goal error", err);
  }
};
useEffect(() => {
  loadGoal();
  loadAll();
}, []);
  const loadLibrary = async () => {
    try {
      const data = await getWorkoutLibrary();
      setLibrary(data);
      setDbError(null);
    } catch (err: any) {
      console.error("Load library error", err);
      setDbError("Không thể tải danh sách bài tập.");
      setLibrary([]);
    }
  };

  const loadPlan = async () => {
    const data = await getMyWorkoutPlan();
    setMyPlan(data);
  };

  const loadLogs = async () => {
    const data = await getMyWorkoutLogs();
    setLogs(data);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadLibrary(), loadPlan(), loadLogs()]);
    setLoading(false);
  };

  useEffect(() => {
  calculateGoalProgress();
}, [logs, goal]);

  // search / filter for workouts
  const filteredDbWorkouts = useMemo(() => {
    const q = workoutSearch.trim().toLowerCase();
    if (!q) return library;
    return library.filter((w) => {
      const title = (w.name || "").toLowerCase();
      const level = (w.difficulty || "").toLowerCase();
      // category field not in Workout interface but could exist
      return title.includes(q) || level.includes(q);
    });
  }, [library, workoutSearch]);

  const selectedWorkout = useMemo(() => {
    if (!selectedWorkoutId) return null;
    return library.find((w) => w._id === selectedWorkoutId) || null;
  }, [library, selectedWorkoutId]);

  // preview workout detail effect
  useEffect(() => {
    if (!previewWorkoutId) {
      setPreviewWorkout(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchWorkoutDetail = async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/workouts/${previewWorkoutId}`, {
          signal: controller.signal,
        });
        const data = await res.json();

        if (!res.ok) {
          setPreviewWorkout(null);
          setPreviewError(data?.error || "Không thể tải chi tiết bài tập.");
          return;
        }

        setPreviewWorkout(data);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setPreviewWorkout(null);
        setPreviewError("Có lỗi xảy ra khi kết nối tới server.");
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchWorkoutDetail();

    return () => {
      controller.abort();
    };
  }, [previewWorkoutId]);

  // ==========================
  // ACTIONS
  // ==========================

  const handleAddPlan = async (id: string) => {
    await addWorkoutPlan(id, 30);
    loadPlan();
  };

  const handleStart = async (id: string) => {
    await startWorkout(id);
    loadPlan();
  };

  const handleFinish = async (id: string) => {
    await finishWorkout(id);
    loadPlan();
    loadLogs();
  };

  const handleRemove = async (id: string) => {
    await removeWorkoutPlan(id);
    loadPlan();
  };

  // ==========================
  // LEVEL BADGE
  // ==========================

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500 text-white";
      case "Intermediate":
        return "bg-yellow-500 text-white";
      case "Advanced":
        return "bg-red-500 text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  // sample UI data used by the new layout
  const exercises: ExerciseRowProps[] = [
    {
      set: 'Set 1', time: '08:00',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3RRLj_qU6_rKyx5_tenXc3b2nTpWUjcm7tet2EyXz6B03c4tWuNF0cy-2J8D20vmBYPL7QefEz9uEilmx_wXNfiLdtXoRTbgO1O2oJaxsLdDrhY2JCdUTspeCe-Jwc1z437VNUcIhpDDlAaccizyx2Sj1oyi1D0TrtDsDyTim-1yXveQHtl8nl2g5hUTxbbhYch8-xdZMULrpmrjk2WZimA4YtcS1V5tO4orxZDumYcQTiDN7g5uf0C4ZpVQcmkAliSaxZX19gBI',
      name: 'Incline Dumbbell Press', muscle: 'Chest', detail: '4 sets x 10 reps', checked: true,
    },
    {
      set: 'Set 2', time: '08:20',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYB1ORYmZnFWnzg3eqTOgaOAgGT29gORgS_5X0A8vzhgDPVX3KZmykO18d-LB4fcL_3KWDvp8ALKLq1iT9zyzZjbwENjY1--62VeDNWxLEztB2L5memr9ZQ8I9CGbtMyrstcNso8M6GnXV42G3u01T7nK4Gx0KfJU7P1Er6kZ99TU8xztstnOhrjEOoa4Fh_Ay_jwSIoVCjS65AE0Y8NbRBBq8C-9TJNByyZCuy9zthbotqEh9u-PKsz-EeoYgatFESMibrstuOSg',
      name: 'Weighted Pull-ups', muscle: 'Back', detail: '3 sets x 8 reps', isActive: true, checked: false,
    },
    {
      set: 'Set 3', time: '08:45',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbexbzLzbTV-pWC9bUHreccAIe0kUDIe8yEad3KDcSOmqskWU_7EgMph7Hxl261Y2xeQU7Crhut10nuXq4mdNwYgCLvANNve3VHWB_bqtuTgwIcJBVYiKp1Mjwu3q0seZlPQbSVKkX4J9flIWLobaRpb-uy1PpPIwhjyMilwgrWIlrmnBLrwZFKVxMcrn3wCgrmISWMdNiKevRPtuRcIgRqOSVSqT4vxgIJfduz0vzIfm-605aUDs4RX_MAOGA5j6c3X9HzgkCAJQ',
      name: 'Kettlebell Swings', muscle: 'Full Body', detail: '5 sets x 20 reps', checked: false,
    },
  ];

  const recommendations: RecommendCardProps[] = [
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXsVPx7VdS0p_sZivEdM3UANqd9RX9vrmbrufpAUP3NK_NWUrUx1bmWcg3CQR-zPRBf3_BkztMGBSCOvi2vHGuD7eUfgWySlsLpRj4n1CtrCGxiFM-21gSPJ6Z9ElZdZLgh-eEkZA8d_ZOqtQ7-mKnf9i8ZpSLrJeATfthhcmnKEwHStIq1jX534xSVqDznPk2QlHS4wlASewSoM5wATlBd-UiPgbYp5fQKc87d8-6PHEGHsR8jrmlO6FABIgbG-J_S-nvHMuyj0c',
      badge: 'LEVEL UP', name: 'Back Squat', tags: ['Legs', 'Barbell'],
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl0REsQeqGNwFp52PJVX7Wiy9i8Q2SHmHeGbYzOcxIKrW9PIpZAtRClLz8MP61JiW7TV-gDjMyPqFCi_2u-kqX5Z8a6B71ySr5V1OvMaj9fVcQGRPyIZSAsmBVxOVCRHBEhr7Rr0dLCZK61KM5Kfw2JgJwNWiAaLr4zqE_GxJerBse2ijF4JEI9Aibgx2cB2dE4B6r0BSEZbKX5IL4FZlwO8E8Nq6R3We4Ge2-QOcpj0Qs7KCze3NW0AEOPnVC_sBGAUkYTK1mQOc',
      badge: 'RECOVERY', name: 'Classic Push-ups', tags: ['Chest', 'Bodyweight'],
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoVm3WEr02l_-2EF5eaBQZr4Q5p5DV4Kmrd20k0xepK-78NrlvEFqNp05QmYQNytB6Aovqbd5_oVl4qeA7opliK8e-ljIqsDZxvjep3KTOkX7dP2CMzQjQyAGTFN0Yt-DjeSo4lCJGRnHTYS_Dw-qFh-zjrtoadXYG-NdKB16Pl-KZxBs7UOYrFNXLIjmIWJRcFVvPfjEJsA-Q1JeBqj250yNxOWYpDAT_2aI5lDs2taOZK0jzLDnliI3PRPlU5RC1e7Srn4SWVwA',
      badge: 'SCULPT', name: 'Hammer Curls', tags: ['Arms', 'Dumbbells'],
    },
  ];

  const scheduleDays: ScheduleDayProps[] = [
    { label: 'Mon', date: 24, active: true, hasDot: true },
    { label: 'Tue', date: 25, hasDot: true },
    { label: 'Wed', date: 26, hasDot: false },
    { label: 'Thu', date: 27, hasDot: true },
    { label: 'Fri', date: 28, hasDot: true },
    { label: 'Sat', date: 29, hasDot: false },
    { label: 'Sun', date: 30, hasDot: false },
  ];

  const scheduleEvents: ScheduleEventProps[] = [
    { icon: 'fitness_center', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500', title: 'Chest & Triceps', time: 'Tomorrow • 07:00 AM' },
    { icon: 'directions_run', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500', title: 'HIIT Cardio', time: 'Thu, Oct 27 • 06:30 PM' },
    { icon: 'self_improvement', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500', title: 'Active Recovery', time: 'Sat, Oct 29 • 10:00 AM' },
  ];

  return (
    <Layout>
      <div className="flex flex-1 gap-8">
        {/* ── Main Content ── */}
        <div className="flex flex-col flex-1 gap-8">

          {/* Header row (streak/progress + start button) */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-[-0.033em]">
                My Workout &amp; Schedule
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Daily Progress: 65%</span>
                </div>
                <span className="text-slate-400">|</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
                  12 Day Streak
                </span>
              </div>
            </div>
            <button className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary text-slate-900 text-sm font-bold leading-normal transition-all hover:scale-[1.02] shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-xl">play_circle</span>
              <span className="truncate">Start Workout</span>
            </button>
          </div>

          {/* Today's Routine (static example) */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                Today's Routine
                <span className="text-sm font-normal text-slate-500 ml-2">Monday, Oct 24</span>
              </h3>
              <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-base">add</span> Add Exercise
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {exercises.map((ex) => (
                <ExerciseRow key={ex.set} {...ex} />
              ))}
            </div>
          </section>

          {/* Workout list from Database (search/filter) */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">fitness_center</span>
                <h3 className="text-xl font-bold">Chọn bài tập từ hệ thống</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    search
                  </span>
                  <input
                    value={workoutSearch}
                    onChange={(e) => setWorkoutSearch(e.target.value)}
                    placeholder="Tìm theo tên / level / category..."
                    className="h-11 w-[320px] max-w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>

            {dbError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {dbError}
              </div>
            )}

            {selectedWorkout && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span className="font-semibold">
                    Đã chọn: {selectedWorkout.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWorkoutId(null)}
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:underline"
                >
                  Bỏ chọn
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              {loading ? (
                <div className="text-sm text-slate-500 px-2 py-6">Đang tải danh sách bài tập...</div>
              ) : filteredDbWorkouts.length === 0 ? (
                <div className="text-sm text-slate-500 px-2 py-6">Không tìm thấy bài tập phù hợp.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredDbWorkouts.slice(0, 9).map((w) => {
                    const title = w.name || "Workout";
                    const isSelected = selectedWorkoutId === w._id;
                    const img =
                      w.cover_image ||
                      "https://placehold.co/600x400/png?text=Workout";
                    const level = w.difficulty || "";
                    const calories = w.estimatedCalories;
                    const duration = w.duration;
                    const category = w.category || "";

                    return (
                      <button
                        key={w._id}
                        type="button"
                        onClick={() => setPreviewWorkoutId(w._id)}
                        className={`text-left group rounded-xl border p-3 transition-colors ${isSelected
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 dark:border-slate-800 hover:border-primary/40"
                          }`}
                      >
                        <h4 className="font-bold mb-2">{title}</h4>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-slate-200 px-3 py-1 rounded-full">
                            🔥 {calories || 0} kcal
                          </span>
                          <span className="text-xs bg-slate-200 px-3 py-1 rounded-full">
                            ⏱ {duration} min
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!loading && filteredDbWorkouts.length > 9 && (
                <div className="pt-3 px-1 text-xs text-slate-500">
                  Đang hiển thị 9/{filteredDbWorkouts.length} bài tập. Hãy dùng ô tìm kiếm để lọc thêm.
                </div>
              )}
            </div>
          </section>

          {/* insert original plan/history sections */}
          <div>
            <h2 className="text-2xl font-bold mb-4">My Workout Plan</h2>
            {myPlan.length === 0 ? (
              <div className="text-slate-500">
                You haven't added any workout yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPlan.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold">{item.workout_id?.name}</h3>
                      <p className="text-sm text-slate-500">
                        Duration: {item.planned_duration} min
                      </p>
                      <p className="text-xs text-slate-400">
                        Status: {item.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {item.status === "planned" && (
                        <button
                          onClick={() => handleStart(item._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Start
                        </button>
                      )}
                      {item.status === "in_progress" && (
                        <button
                          onClick={() => handleFinish(item._id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Finish
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Workout History</h2>
            {logs.length === 0 ? (
              <div className="text-slate-500">No workout logs yet</div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="p-3 text-left">Workout</th>
                      <th className="p-3 text-left">Duration</th>
                      <th className="p-3 text-left">Calories</th>
                      <th className="p-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} className="border-t">
                        <td className="p-3">{log.workout_id?.name}</td>
                        <td className="p-3">{log.duration_minutes} min</td>
                        <td className="p-3">🔥 {log.calories_burned}</td>
                        <td className="p-3">{new Date(log.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="text-xl font-bold">AI Recommended for You</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {recommendations.map((rec) => (
                <RecommendCard key={rec.name} {...rec} />
              ))}
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-[380px] hidden xl:flex flex-col gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Schedule Planner</h3>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>

            {/* Week grid */}
            <div className="grid grid-cols-7 gap-2">
              {scheduleDays.map((day) => (
                <ScheduleDay key={day.label} {...day} />
              ))}
            </div>

            {/* Weekly overview */}
            <div className="flex flex-col gap-4 mt-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Weekly Overview</h4>
              <div className="flex flex-col gap-3">
                {scheduleEvents.map((ev) => (
                  <ScheduleEvent key={ev.title} {...ev} />
                ))}
              </div>
            </div>

            <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Schedule New Workout
            </button>
          </div>
        </aside>

        {/* Mobile FAB */}
        <div className="fixed bottom-6 right-6 xl:hidden flex flex-col gap-3">
          <button className="size-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-90">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
          </button>
          <button className="size-14 bg-primary rounded-full shadow-xl flex items-center justify-center text-slate-900 transition-transform active:scale-90">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>

        {/* Detail Modal */}
        {previewWorkoutId && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">fitness_center</span>
                  <h3 className="text-lg font-bold">Thông tin bài tập</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewWorkoutId(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {previewLoading ? (
                <div className="p-6 text-sm text-slate-500">Đang tải chi tiết...</div>
              ) : previewError ? (
                <div className="p-6">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {previewError}
                  </div>
                </div>
              ) : previewWorkout ? (
                <div className="p-6 space-y-6">
                  {(previewWorkout.cover_image || (previewWorkout as any).image) && (
                    <img
                      src={previewWorkout.cover_image || (previewWorkout as any).image}
                      alt={previewWorkout.title || previewWorkout.name || "Workout"}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  )}

                  <div className="flex flex-col gap-3">
                    {/* workout detail content omitted for brevity */}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-sm text-slate-500">Không có dữ liệu.</div>
              )}

              <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (previewWorkoutId) navigate(`/workouts/${previewWorkoutId}`);
                  }}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover.bg-slate-800 transition-colors"
                >
                  Xem trang chi tiết
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewWorkoutId(null)}
                    className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Đóng
                  </button>
                  {/* action buttons omitted for brevity */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkoutsUserPage;