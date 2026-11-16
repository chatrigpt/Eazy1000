import type { Ingredient } from "./data";

export type Pantry = { name: string; quantity: number | null; unit: string; confidence: number };
export type PlanIngredient = {
  name: string;
  quantity?: number | string | null;
  unit?: string;
  estimated_price?: number;
  checkout_price?: number | null;
  product_name?: string;
  pantry_match?: boolean;
  [k: string]: any;
};
export type Meal = {
  title: string;
  day: number;
  date?: string;
  meal: string;
  estimated_cost: number;
  match: number;
  reason?: string;
  ingredients?: PlanIngredient[];
  steps?: any[];
  image?: string;
  imageLoading?: boolean;
};
export type PlanResult = { mode?: string; summary: any; meals: Meal[]; shopping: any[]; notice?: string };
export type Cart = Ingredient & {
  id: string;
  recipe: string;
  done: boolean;
  listId?: string;
  createdAt?: string;
  listTitle?: string;
};

export const money = (n: number | null | undefined) =>
  n == null ? "À vérifier" : new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " F";
