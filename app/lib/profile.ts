// Le foyer : réglages saisis une seule fois, puis réutilisés pour chaque plan.
export type Profile = {
  onboarded: boolean;
  people: number;
  weeklyBudget: number;
  goal: string;
  cuisines: string[];
  mealSlots: string[];
};

export const GOALS = ["Manger mieux", "Petit budget", "Perdre du poids", "Faire avec ce que j’ai", "Me régaler"];
export const CUISINES = ["Africaine", "Occidentale", "Asiatique", "Arabe"];
export const SLOTS = ["Petit-déjeuner", "Déjeuner", "Dîner", "Goûter", "Collation"];

export const DEFAULT_PROFILE: Profile = {
  onboarded: false,
  people: 2,
  weeklyBudget: 25000,
  goal: "Manger mieux",
  cuisines: [...CUISINES],
  mealSlots: ["Déjeuner", "Dîner"],
};

const KEY = "eazy1000-profile";

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

/** Budget du plan, proportionnel au budget hebdomadaire, arrondi à 500 F. */
export const budgetFor = (weekly: number, days: number) =>
  Math.max(2000, Math.round((weekly * days) / 7 / 500) * 500);
