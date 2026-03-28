export interface Category {
  _id: string;
  name: string;
  description: string;
}

const BASE_URL =
  (import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEV || "http://localhost:8000"
    : import.meta.env.VITE_API_URL || "https://healthmate-y9vt.onrender.com");

export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${BASE_URL}/api/workout-categories`);

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
};
