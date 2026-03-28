const TRIAL_DAYS = 7;
const PRO_DAYS = 30;

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const createTrialEndDate = (fromDate = new Date()) => addDays(fromDate, TRIAL_DAYS);

const createProEndDate = (fromDate = new Date()) => addDays(fromDate, PRO_DAYS);

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isFuture = (value) => {
  const date = toDate(value);
  return Boolean(date && date > new Date());
};

const getTrialEndDateFromUser = (user) => {
  const createdAt = toDate(user?.createdAt);
  if (!createdAt) return toDate(user?.subscription?.endDate) || createTrialEndDate();
  return addDays(createdAt, TRIAL_DAYS);
};

const getSubscriptionSnapshot = (user) => {
  const plan = user?.subscription?.plan || "free";
  const endDate = plan === "trial"
    ? getTrialEndDateFromUser(user)
    : toDate(user?.subscription?.endDate);

  const isTrialActive = plan === "trial" && isFuture(endDate);
  const isProActive = plan === "pro" && isFuture(endDate);
  const hasPremiumAccess = isTrialActive || isProActive;

  let daysLeft = 0;
  if (hasPremiumAccess && endDate) {
    const diffMs = endDate.getTime() - Date.now();
    daysLeft = Math.max(Math.ceil(diffMs / (24 * 60 * 60 * 1000)), 0);
  }

  return {
    plan,
    endDate,
    isTrialActive,
    isProActive,
    hasPremiumAccess,
    daysLeft,
  };
};

const syncExpiredSubscription = async (userDoc) => {
  if (!userDoc) return null;

  const plan = userDoc?.subscription?.plan || "free";
  const storedEndDate = toDate(userDoc?.subscription?.endDate);
  const endDate = plan === "trial" ? getTrialEndDateFromUser(userDoc) : storedEndDate;

  const shouldExpire = (plan === "trial" || plan === "pro") && (!endDate || endDate <= new Date());

  if (shouldExpire) {
    userDoc.subscription = {
      ...(userDoc.subscription || {}),
      plan: "free",
      endDate: null,
    };

    if (typeof userDoc.save === "function") {
      await userDoc.save();
    }
  } else if (
    plan === "trial" &&
    endDate &&
    (!storedEndDate || storedEndDate.getTime() !== endDate.getTime())
  ) {
    // Keep trial strictly fixed to account creation date (+7 days).
    userDoc.subscription = {
      ...(userDoc.subscription || {}),
      plan: "trial",
      endDate,
    };
    if (typeof userDoc.save === "function") {
      await userDoc.save();
    }
  }

  return getSubscriptionSnapshot(userDoc);
};

const toClientSubscription = (user) => {
  const snapshot = getSubscriptionSnapshot(user);
  return {
    plan: snapshot.plan,
    endDate: snapshot.endDate,
    isTrialActive: snapshot.isTrialActive,
    isProActive: snapshot.isProActive,
    hasPremiumAccess: snapshot.hasPremiumAccess,
    daysLeft: snapshot.daysLeft,
  };
};

module.exports = {
  TRIAL_DAYS,
  PRO_DAYS,
  createTrialEndDate,
  createProEndDate,
  isFuture,
  getSubscriptionSnapshot,
  syncExpiredSubscription,
  toClientSubscription,
};
