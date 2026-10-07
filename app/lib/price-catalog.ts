import priceData from "../../data/food-prices-ci.json";

export type PriceRef = {
  id: string;
  key: string;
  aliases: string[];
  product: string;
  packageQty: number;
  packageUnit: "g" | "kg" | "ml" | "cl" | "L" | "unit";
  price: number;
  source: string;
  observedAt: string;
  kind: "retail" | "market";
  city: "Abidjan";
  zone: string;
  url?: string;
  orderable: boolean;
  availability?: string;
  unitPrice?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
};

type IngredientDef = { aliases: string[]; category: string };
type SourceDef = [name: string, url: string, type: string];

const RAW = priceData as any;
const INGREDIENTS = RAW.ingredients as Record<string, IngredientDef>;
const SOURCES = RAW.sources as Record<string, SourceDef>;

const normalizeUnit = (value: unknown): PriceRef["packageUnit"] | null => {
  const u = String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (u === "kg" || u === "g" || u === "ml" || u === "cl") return u;
  if (u === "l") return "L";
  if (["unit", "unite", "piece", "boule"].includes(u)) return "unit";
  return null;
};

export const PRICE_DATASET_META = RAW.meta as {
  version: string;
  market: string;
  zone: string;
  currency: string;
  observations: number;
};

export const PRICE_POLICY = RAW.policy as {
  never_invent_price: boolean;
  market_benchmark_is_orderable: boolean;
  meal_cost: string;
  shopping_cost: string;
  checkout_total: string;
};

export const ABIDJAN_PRICE_CATALOG: PriceRef[] = (RAW.prices as any[][]).flatMap((row) => {
  const unit = normalizeUnit(row[5]);
  const qty = Number(row[4]);
  const price = Number(row[6]);
  const key = String(row[1] ?? "");
  const ingredient = INGREDIENTS[key];
  const source = SOURCES[String(row[14] ?? "")];

  if (!unit || !ingredient || !source || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price)) {
    return [];
  }

  const availability = String(row[10] ?? "");
  if (/rupture/i.test(availability)) return [];

  const productName = String(row[2] ?? "");
  const variant = String(row[3] ?? "").trim();
  const aliases = Array.from(
    new Set(
      [
        key.replace(/_/g, " "),
        ...ingredient.aliases,
        productName,
        variant
      ].filter(Boolean)
    )
  );

  return [{
    id: String(row[0]),
    key,
    aliases,
    product: variant ? `${productName} · ${variant}` : productName,
    packageQty: qty,
    packageUnit: unit,
    price,
    source: source[0],
    observedAt: String(row[13] ?? PRICE_DATASET_META.version),
    kind: row[12] === "weight" ? "market" : "retail",
    city: "Abidjan",
    zone: PRICE_DATASET_META.zone,
    url: source[1] || undefined,
    orderable: Boolean(row[11]),
    availability,
    unitPrice: row[7] == null ? null : Number(row[7]),
    minPrice: row[8] == null ? null : Number(row[8]),
    maxPrice: row[9] == null ? null : Number(row[9])
  } satisfies PriceRef];
});

export const PRICE_CATALOG_TEXT = ABIDJAN_PRICE_CATALOG
  .map((x) =>
    `${x.product} | ${x.packageQty} ${x.packageUnit} | ${x.price} FCFA | ${x.source} | ${x.observedAt}`
  )
  .join("\n");
