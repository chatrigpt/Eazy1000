"use client";

import { useState } from "react";
import { ArrowRight, Check, ClipboardPaste, PackageOpen, Play, Plus, ShoppingBasket, Sparkles } from "lucide-react";
import type { Recipe } from "../app/data";
import { CUISINES, GOALS, SLOTS } from "../app/lib/profile";
import { money, type Meal } from "../app/types";
import { Counter, Sheet } from "./ui";

/* ---------------------------- Planificateur ---------------------------- */
export function PlannerSheet(p: {
  budget: number;
  setBudget: (n: number) => void;
  people: number;
  setPeople: (n: number) => void;
  days: number;
  setDays: (n: number) => void;
  goal: string;
  setGoal: (s: string) => void;
  mealSlots: string[];
  setMealSlots: (f: (v: string[]) => string[]) => void;
  cuisines: string[];
  setCuisines: (f: (v: string[]) => string[]) => void;
  close: () => void;
  run: () => void;
}) {
  const toggle = (set: (f: (v: string[]) => string[]) => void, x: string) =>
    set((v) => (v.includes(x) ? v.filter((y) => y !== x) : [...v, x]));
  const n = p.days * p.mealSlots.length;

  return (
    <Sheet close={p.close} label="Planifier mes repas" tall>
      <h2 className="sheet-title">Planifier mes repas</h2>
      <p className="sheet-text">Eazy propose un plat pour chaque repas choisi, chaque jour, à partir d'aujourd'hui.</p>

      <div className="counters">
        <Counter label="Jours" value={p.days} set={p.setDays} min={1} max={14} />
        <Counter label="Personnes" value={p.people} set={p.setPeople} min={1} max={12} />
      </div>

      <div className="budget-pick compact">
        <div className="budget-line">
          <span>Budget pour ces {p.days} jours</span>
          <b>{money(p.budget)}</b>
        </div>
        <input type="range" min={2000} max={150000} step={500} value={p.budget} onChange={(e) => p.setBudget(Number(e.target.value))} aria-label="Budget du plan" />
      </div>

      <h3 className="sheet-label">Repas à planifier</h3>
      <div className="chips">
        {SLOTS.map((x) => (
          <button key={x} className={`chip ${p.mealSlots.includes(x) ? "on" : ""}`} onClick={() => toggle(p.setMealSlots, x)} aria-pressed={p.mealSlots.includes(x)}>
            {p.mealSlots.includes(x) ? <Check /> : <Plus />} {x}
          </button>
        ))}
      </div>

      <h3 className="sheet-label">Objectif</h3>
      <div className="chips">
        {GOALS.map((g) => (
          <button key={g} className={`chip ${p.goal === g ? "on" : ""}`} onClick={() => p.setGoal(g)} aria-pressed={p.goal === g}>
            {g}
          </button>
        ))}
      </div>

      <h3 className="sheet-label">Cuisines autorisées</h3>
      <div className="chips">
        {CUISINES.map((x) => (
          <button key={x} className={`chip ${p.cuisines.includes(x) ? "on" : ""}`} onClick={() => toggle(p.setCuisines, x)} aria-pressed={p.cuisines.includes(x)}>
            {p.cuisines.includes(x) ? <Check /> : <Plus />} {x}
          </button>
        ))}
      </div>

      <button className="btn btn-green sheet-go" onClick={p.run} disabled={!p.mealSlots.length || !p.cuisines.length}>
        <Sparkles /> Composer {n} repas
      </button>
    </Sheet>
  );
}

/* ---------------------------- Recette d'inspiration ---------------------------- */
export function RecipeSheet({ r, close, add }: { r: Recipe; close: () => void; add: () => void }) {
  const total = r.ingredients.reduce((a, i) => a + i.price, 0);
  return (
    <Sheet close={close} label={r.name} tall>
      <div className="sheet-photo">
        <img src={r.image} alt="" />
      </div>
      <span className="origin">{r.origin}</span>
      <h2 className="sheet-title">{r.name}</h2>
      <p className="sheet-text">
        {r.time} minutes, environ {money(r.price)}. Tu as déjà {r.owned} % des ingrédients.
      </p>
      <ul className="ing-list">
        {r.ingredients.map((i) => (
          <li key={i.name}>
            <span>
              {i.name}
              <small>{i.qty}</small>
            </span>
            <b>{money(i.price)}</b>
          </li>
        ))}
        <li className="ing-total">
          <span>Total des ingrédients</span>
          <b>{money(total)}</b>
        </li>
      </ul>
      <button className="btn btn-green sheet-go" onClick={add}>
        <ShoppingBasket /> Ajouter aux courses
      </button>
    </Sheet>
  );
}

/* ---------------------------- Repas du plan ---------------------------- */
export function MealSheet({
  meal,
  close,
  add,
  deliver,
  cook,
}: {
  meal: Meal;
  close: () => void;
  add: () => void;
  deliver: () => void;
  cook: () => void;
}) {
  const all = meal.ingredients || [];
  const missing = all.filter((x) => !x.pantry_match);
  const have = all.length - missing.length;
  return (
    <Sheet close={close} label={meal.title} tall>
      {meal.image && (
        <div className="sheet-photo">
          <img src={meal.image} alt="" />
        </div>
      )}
      <span className="origin">{meal.meal}</span>
      <h2 className="sheet-title">{meal.title}</h2>
      {meal.reason && <p className="sheet-text">{meal.reason}</p>}
      {all.length > 0 && (
        <div className="have">
          <div>
            <b>
              {have} sur {all.length} ingrédients déjà chez toi
            </b>
            <small>{missing.length ? `${missing.length} à acheter` : "Rien à acheter"}</small>
          </div>
          <div className="have-bar" aria-hidden>
            <i style={{ width: (have / (all.length || 1)) * 100 + "%" }} />
          </div>
        </div>
      )}
      <ul className="ing-list">
        {all.map((x, i) => (
          <li key={i} className={x.pantry_match ? "owned" : ""}>
            <span>
              {x.name}
              <small>
                {x.quantity ?? "à prévoir"} {x.unit || ""}
              </small>
            </span>
            <b>{x.pantry_match ? "Déjà là" : money(x.checkout_price ?? x.estimated_price ?? null)}</b>
          </li>
        ))}
      </ul>
      <button className="btn btn-green sheet-go" onClick={cook}>
        <Play /> Cuisiner maintenant
      </button>
      <div className="row2">
        <button className="btn btn-line" onClick={add}>
          <ShoppingBasket /> Courses
        </button>
        <button className="btn btn-line" onClick={deliver}>
          <PackageOpen /> Faire livrer
        </button>
      </div>
    </Sheet>
  );
}

/* ---------------------------- Lien vidéo ---------------------------- */
export function VideoSheet({ close, analyze }: { close: () => void; analyze: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const paste = async () => {
    try {
      setUrl((await navigator.clipboard.readText()).trim());
      setErr("");
    } catch {
      setErr("Colle le lien dans le champ avec un appui long.");
    }
  };
  const go = () => {
    if (!/^https?:\/\//i.test(url.trim())) {
      setErr("Colle un lien qui commence par https://");
      return;
    }
    analyze(url.trim());
  };
  return (
    <Sheet close={close} label="Recette d'une vidéo">
      <h2 className="sheet-title">Une vidéo t'a donné faim ?</h2>
      <p className="sheet-text">Colle le lien d'une vidéo TikTok, Instagram ou YouTube. Eazy en tire la recette, les quantités et les étapes.</p>
      <div className="url-field">
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setErr("");
          }}
          placeholder="https://www.tiktok.com/@…"
          inputMode="url"
          aria-label="Lien de la vidéo"
        />
        <button className="icon-btn" onClick={paste} aria-label="Coller le lien">
          <ClipboardPaste />
        </button>
      </div>
      {err && <p className="field-error">{err}</p>}
      <button className="btn btn-green sheet-go" onClick={go}>
        Extraire la recette <ArrowRight />
      </button>
    </Sheet>
  );
}

/* ---------------------------- Livraison ---------------------------- */
export function DeliverySheet({ order, close, confirm }: { order: any; close: () => void; confirm: (store: string) => void }) {
  const [store, setStore] = useState("Allo Market");
  const stores = [
    { name: "Allo Market", note: "Partenaire, démonstration" },
    { name: "Supermarché partenaire", note: "Bientôt disponible" },
    { name: "Commerce de proximité", note: "Bientôt disponible" },
  ];
  const items = order.items || [];
  const subtotal = items.reduce((a: number, x: any) => a + (x.checkout_price ?? x.estimated_price ?? 0), 0);
  const fee = 1500;
  return (
    <Sheet close={close} label="Faire livrer" tall>
      <h2 className="sheet-title">Faire livrer {order.title ? `« ${order.title} »` : "les courses"}</h2>
      <p className="sheet-text">Choisis qui prépare les ingrédients manquants. Les frais de livraison sont à ta charge.</p>
      <div className="stores">
        {stores.map((s) => (
          <button key={s.name} className={`store ${store === s.name ? "on" : ""}`} onClick={() => setStore(s.name)} aria-pressed={store === s.name}>
            <b>{s.name}</b>
            <small>{s.note}</small>
          </button>
        ))}
      </div>
      <div className="ticket mini">
        <ul className="ticket-lines">
          {items.map((x: any, i: number) => (
            <li key={i}>
              <div className="static">
                <span className="line-name">{x.name}</span>
                <span className="leader" aria-hidden />
                <span className="line-price">{money(x.checkout_price ?? x.estimated_price ?? 0)}</span>
              </div>
            </li>
          ))}
          <li>
            <div className="static">
              <span className="line-name">Livraison estimée</span>
              <span className="leader" aria-hidden />
              <span className="line-price">{money(fee)}</span>
            </div>
          </li>
        </ul>
        <div className="ticket-total">
          <span>Total indicatif</span>
          <b>{money(subtotal + fee)}</b>
        </div>
      </div>
      <button className="btn btn-green sheet-go" onClick={() => confirm(store)}>
        Préparer le panier chez {store}
      </button>
    </Sheet>
  );
}
