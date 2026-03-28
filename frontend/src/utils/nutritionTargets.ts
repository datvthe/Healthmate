export type GoalType = 'fat_loss' | 'muscle_gain' | 'endurance' | 'maintain';
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const normalizeGoalType = (goalType?: string | null): GoalType => {
  const raw = String(goalType || '').toLowerCase();
  if (raw === 'fat_loss' || raw === 'muscle_gain' || raw === 'endurance' || raw === 'maintain') {
    return raw;
  }
  if (raw === 'lose_weight' || raw === 'weight_loss' || raw === 'cutting') return 'fat_loss';
  if (raw === 'gain_muscle' || raw === 'bulk' || raw === 'bulking') return 'muscle_gain';
  if (raw === 'keep_fit' || raw === 'maintenance') return 'maintain';
  return 'maintain';
};

export const getAgeFromBirthDate = (birthDate?: string | Date | null, fallbackAge = 25): number => {
  if (!birthDate) return clamp(fallbackAge, 15, 80);
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return clamp(fallbackAge, 15, 80);

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return clamp(age, 15, 80);
};

export const calculateCalorieTargetFromProfile = ({
  weight,
  height,
  gender,
  age,
  goalType,
}: {
  weight: number;
  height: number;
  gender?: string;
  age?: number;
  goalType?: string;
}) => {
  const safeWeight = clamp(Number(weight) || 70, 20, 300);
  const safeHeight = clamp(Number(height) || 170, 120, 230);
  const safeAge = clamp(Number(age) || 25, 15, 80);
  const safeGender = ['male', 'female', 'other'].includes(String(gender || '').toLowerCase())
    ? String(gender).toLowerCase()
    : 'male';
  const normalizedGoal = normalizeGoalType(goalType);

  const heightM = safeHeight / 100;
  const bmi = safeWeight / (heightM * heightM);
  let bmiCategory: BmiCategory = 'normal';
  if (bmi < 18.5) bmiCategory = 'underweight';
  else if (bmi < 25) bmiCategory = 'normal';
  else if (bmi < 30) bmiCategory = 'overweight';
  else bmiCategory = 'obese';

  const bmrBase = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;
  const bmr = safeGender === 'female' ? bmrBase - 161 : bmrBase + 5;
  const tdee = bmr * 1.45;

  let goalDelta = 0;
  if (normalizedGoal === 'fat_loss') goalDelta = -500;
  else if (normalizedGoal === 'muscle_gain') goalDelta = 300;
  else if (normalizedGoal === 'endurance') goalDelta = 150;

  let bmiDelta = 0;
  if (bmiCategory === 'underweight') bmiDelta = 200;
  if (bmiCategory === 'overweight') bmiDelta = normalizedGoal === 'fat_loss' ? -200 : -100;
  if (bmiCategory === 'obese') bmiDelta = normalizedGoal === 'fat_loss' ? -300 : -200;

  const lowerBound = safeGender === 'female' ? 1200 : 1400;
  const targetCalories = Math.round(clamp(tdee + goalDelta + bmiDelta, lowerBound, 3800));

  return {
    targetCalories,
    bmi: Number(bmi.toFixed(1)),
    bmiCategory,
    normalizedGoal,
  };
};

export const getGoalLabel = (goalType: string) => {
  const normalizedGoal = normalizeGoalType(goalType);
  if (normalizedGoal === 'fat_loss') return 'Fat Loss';
  if (normalizedGoal === 'muscle_gain') return 'Muscle Gain';
  if (normalizedGoal === 'endurance') return 'Endurance';
  return 'Maintain';
};

export const getBmiCategoryLabel = (bmiCategory: string) => {
  if (bmiCategory === 'underweight') return 'Underweight';
  if (bmiCategory === 'overweight') return 'Overweight';
  if (bmiCategory === 'obese') return 'Obese';
  return 'Normal';
};
