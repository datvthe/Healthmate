import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getWorkoutById } from "../services/workoutService";

const WorkoutDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getWorkoutById(id).then(setWorkout);
    }
  }, [id]);

  if (!workout)
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading...
      </div>
    );

  const getYoutubeId = (url: string) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
      <Navbar />

      <div className="p-8 max-w-6xl mx-auto">

        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate("/workouts")}
          className="mb-6 px-5 py-2 bg-slate-800 text-white rounded-full shadow hover:bg-slate-700 transition"
        >
          ← Back to Workouts
        </button>

        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg mb-10">
          <h1 className="text-4xl font-bold mb-3">
            {workout.title}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {workout.description}
          </p>

          <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-semibold">
            🔥 {workout.calories_burned} kcal burned
          </div>
        </div>

        {/* Exercises */}
        <h2 className="text-2xl font-bold mb-6">Exercises</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {workout.exercises.map((ex: any, index: number) => {
            const videoId = getYoutubeId(ex.video_url);

            if (!videoId) {
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md"
                >
                  <h3 className="font-bold text-lg">
                    {ex.title}
                  </h3>
                  <p className="text-red-500 mt-2">
                    Video không hợp lệ
                  </p>
                </div>
              );
            }

            const embedUrl = `https://www.youtube.com/embed/${videoId}`;

            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
              >
                {/* Responsive Video */}
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">
                    {ex.title}
                  </h3>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>⏱ {ex.duration_sec} sec</span>
                    <span className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                      Exercise #{index + 1}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage;