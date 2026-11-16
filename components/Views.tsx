"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, ChefHat, Clock3, PackageOpen, Play, RefreshCw, ShoppingBasket, Trash2, Users } from "lucide-react";
import { recipes, type Recipe } from "../app/data";
import { img } from "../app/lib/images";
import { money, type Cart, type Meal, type Pantry, type PlanResult } from "../app/types";
import { Empty, Wordmark } from "./ui";

const todayISO = () => new Date().toISOString().slice(0, 10);
const dayLabel = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso + "T12:00:00")) : "";

function greeting() {
  const h = new Date().getHours();
  return h < 5 || h >= 18 ? "Bonsoir" : "Bonjour";
}

/** Prochain repas du plan à partir d'aujourd'hui. */
function nextMeal(plan: PlanResult | null): Meal | null {
  if (!plan?.meals?.length) return null;
  const t = todayISO();
  return plan.meals.find((m) => !m.date || m.date >= t) ?? null;
}

function mealWhen(m: Meal) {
  if (!m.date) return `Jour ${m.day}, ${m.meal.toLowerCase()}`;
  const t = todayISO();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const d = m.date === t ? "Aujourd'hui" : m.date === tomorrow ? "Demain" : dayLabel(m.date);
  return `${d}, ${m.meal.toLowerCase()}`;
}

/* ---------------------------- Aujourd'hui ---------------------------- */
export function TodayView({
  people,
  plan,
  pantry,
  video,
  editFoyer,
  openPlanner,
  scan,
  openVideo,
  openRecipe,
  openMeal,
  cookMeal,
  goTab,
}: {
  people: number;
  plan: PlanResult | null;
  pantry: Pantry[];
  video: any;
  editFoyer: () => void;
  openPlanner: () => void;
  scan: () => void;
  openVideo: () => void;
  openRecipe: (r: Recipe) => void;
  openMeal: (m: Meal) => void;
  cookMeal: (m: Meal) => void;
  goTab: (t: string) => void;
}) {
  const next = nextMeal(plan);
  const budget = plan?.summary?.budget;
  const total = plan?.summary?.estimated_total;
  const pct = budget && total ? Math.min(100, Math.round((total / budget) * 100)) : 0;

  return (
    <>
      <header className="topbar">
        <Wordmark />
        <button className="foyer-chip" onClick={editFoyer} aria-label="Modifier mon foyer">
          <Users /> {people} pers.
        </button>
      </header>

      <div className="hello">
        <p>{greeting()}</p>
        <h1>{next ? "Voilà ce qu'on mange." : "On planifie la semaine ?"}</h1>
      </div>

      {next ? (
        <article className="next-meal">
          <button className="next-img" onClick={() => openMeal(next)} aria-label={`Voir ${next.title}`}>
            {next.image ? <img src={next.image} alt="" /> : <img src={img("plan-week", 828)} alt="" />}
          </button>
          <div className="next-body">
            <span className="when">{mealWhen(next)}</span>
            <h2>{next.title}</h2>
            <div className="next-actions">
              <button className="btn btn-green" onClick={() => cookMeal(next)}>
                <Play /> Cuisiner
              </button>
              <button className="btn btn-line" onClick={() => openMeal(next)}>
                Ingrédients
              </button>
            </div>
          </div>
        </article>
      ) : (
        <button className="plan-hero" onClick={openPlanner}>
          <img src={img("plan-week", 828)} alt="" />
          <div>
            <h2>Ta semaine de repas, prête en une minute.</h2>
            <p>Avec ton budget, ce que tu as déjà et les prix du marché.</p>
            <span className="btn btn-green">Planifier mes repas</span>
          </div>
        </button>
      )}

      {plan && budget > 0 && (
        <button className="gauge" onClick={() => goTab("plan")}>
          <div className="gauge-head">
            <span>Ton plan en cours</span>
            <b>
              {money(total)} sur {money(budget)}
            </b>
          </div>
          <div className="gauge-bar" aria-hidden>
            <i style={{ width: pct + "%" }} className={pct > 100 ? "over" : ""} />
          </div>
          {plan.summary?.saved_by_pantry > 0 && (
            <small>{money(plan.summary.saved_by_pantry)} économisés grâce à ce que tu as déjà.</small>
          )}
        </button>
      )}

      <div className="actions3">
        <button onClick={scan}>
          <img src={img("feat-scan", 256)} alt="" />
          <b>Scanner mon frigo</b>
        </button>
        <button onClick={openVideo}>
          <img src={img("feat-video", 256)} alt="" />
          <b>Recette d'une vidéo</b>
        </button>
        <button onClick={openPlanner}>
          <img src={img("feat-plan", 256)} alt="" />
          <b>{plan ? "Nouveau plan" : "Planifier"}</b>
        </button>
      </div>

      {pantry.length > 0 && (
        <button className="row-card" onClick={() => goTab("pantry")}>
          <div>
            <b>{pantry.length} aliments dans ton garde-manger</b>
            <span>Eazy les utilise en priorité dans tes plans.</span>
          </div>
          <ArrowRight />
        </button>
      )}
      {video?.recipe?.title && (
        <button className="row-card" onClick={() => goTab("video")}>
          <div>
            <b>{video.recipe.title}</b>
            <span>Ta dernière recette extraite d'une vidéo.</span>
          </div>
          <ArrowRight />
        </button>
      )}

      <h3 className="h-section">À cuisiner bientôt</h3>
      <div className="recipe-rail">
        {recipes.map((r) => (
          <button key={r.id} className="recipe" onClick={() => openRecipe(r)}>
            <div className="recipe-img">
              <img src={r.image} alt="" loading="lazy" />
              {r.local && <span className="tag">{r.tag}</span>}
            </div>
            <strong>{r.name}</strong>
            <span className="recipe-meta">
              <Clock3 /> {r.time} min, {money(r.price)}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------------------- Mes repas ---------------------------- */
export function PlanView({
  plan,
  regenerate,
  openMeal,
  prepareMeal,
  coursesMeal,
  addAll,
  deliver,
}: {
  plan: PlanResult | null;
  regenerate: () => void;
  openMeal: (m: Meal) => void;
  prepareMeal: (m: Meal) => void;
  coursesMeal: (m: Meal) => void;
  addAll: () => void;
  deliver: () => void;
}) {
  const groups = useMemo(() => {
    const g: [string, Meal[]][] = [];
    for (const m of plan?.meals ?? []) {
      const k = m.date || String(m.day);
      const hit = g.find(([key]) => key === k);
      if (hit) hit[1].push(m);
      else g.push([k, [m]]);
    }
    return g;
  }, [plan]);
  const t = todayISO();
  const [sel, setSel] = useState(() => Math.max(0, groups.findIndex(([k]) => k >= t)));

  if (!plan)
    return (
      <Empty
        image="feat-plan"
        title="Pas encore de plan."
        text="Dis à Eazy combien de jours tu veux prévoir : il compose les repas et la liste de courses qui va avec."
        action="Planifier mes repas"
        go={regenerate}
      />
    );

  const [key, meals] = groups[Math.min(sel, groups.length - 1)] ?? ["", []];

  return (
    <>
      <div className="hello compact">
        <h1>Tes repas</h1>
        <p className="lead">
          {plan.meals.length} plats pour {groups.length} jour{groups.length > 1 ? "s" : ""}, estimés à {money(plan.summary?.estimated_total)}.
        </p>
      </div>

      <div className="days" role="tablist" aria-label="Jours du plan">
        {groups.map(([k, ms], i) => {
          const d = ms[0]?.date ? new Date(ms[0].date + "T12:00:00") : null;
          return (
            <button key={k} role="tab" aria-selected={i === sel} className={`day ${i === sel ? "on" : ""} ${k === t ? "today" : ""}`} onClick={() => setSel(i)}>
              <small>{d ? new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d).replace(".", "") : "Jour"}</small>
              <b>{d ? d.getDate() : ms[0]?.day}</b>
            </button>
          );
        })}
      </div>

      <p className="day-title">{meals[0]?.date ? dayLabel(meals[0].date) : `Jour ${meals[0]?.day ?? ""}`}</p>
      <div className="meals" key={key}>
        {meals.map((m, i) => (
          <article key={i} className="meal">
            <button className="meal-img" onClick={() => openMeal(m)} aria-label={`Voir ${m.title}`}>
              {m.image ? (
                <img src={m.image} alt="" />
              ) : (
                <span className={m.imageLoading ? "meal-ph loading" : "meal-ph"}>
                  <ChefHat />
                </span>
              )}
            </button>
            <div className="meal-body">
              <span className="slot">{m.meal}</span>
              <h3 onClick={() => openMeal(m)}>{m.title}</h3>
              {m.reason && <p>{m.reason}</p>}
              <div className="meal-actions">
                <button onClick={() => prepareMeal(m)}>
                  <Play /> Cuisiner
                </button>
                <button onClick={() => coursesMeal(m)}>
                  <ShoppingBasket /> Courses
                </button>
                {m.estimated_cost > 0 && <span className="cost">{money(m.estimated_cost)}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="summary">
        <div>
          <small>Budget</small>
          <b>{money(plan.summary?.budget)}</b>
        </div>
        <div>
          <small>Estimation</small>
          <b>{money(plan.summary?.estimated_total)}</b>
        </div>
        <div>
          <small>Économisé</small>
          <b>{money(plan.summary?.saved_by_pantry || 0)}</b>
        </div>
      </div>

      <div className="stack">
        <button className="btn btn-green" onClick={addAll}>
          <ShoppingBasket /> Créer la liste de courses du plan
        </button>
        <button className="btn btn-line" onClick={deliver}>
          <PackageOpen /> Faire livrer les courses
        </button>
        <button className="text-btn center" onClick={regenerate}>
          <RefreshCw /> Refaire un plan
        </button>
      </div>
      {plan.notice && <p className="notice">{plan.notice}</p>}
    </>
  );
}

/* ---------------------------- Courses : tickets de caisse ---------------------------- */
export function CartView({
  cart,
  setCart,
  deliver,
  openPlanner,
}: {
  cart: Cart[];
  setCart: (c: Cart[]) => void;
  deliver: (title: string, items: any[]) => void;
  openPlanner: () => void;
}) {
  if (!cart.length)
    return (
      <Empty
        image="empty-cart"
        title="Ton panier attend."
        text="Ajoute les ingrédients d'une recette ou de ton plan de repas : ils arrivent ici sous forme de ticket, prix compris."
        action="Planifier mes repas"
        go={openPlanner}
      />
    );

  const groups: [string, Cart[]][] = [];
  for (const x of cart) {
    const k = x.listId || "legacy";
    const hit = groups.find(([key]) => key === k);
    if (hit) hit[1].push(x);
    else groups.push([k, [x]]);
  }
  groups.sort((a, b) => String(b[1][0]?.createdAt || "").localeCompare(String(a[1][0]?.createdAt || "")));
  const left = cart.filter((x) => !x.done).reduce((a, x) => a + Number(x.price || 0), 0);
  const fmt = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
      : "Liste précédente";

  return (
    <>
      <div className="hello compact">
        <h1>Tes courses</h1>
        <p className="lead">
          {groups.length} ticket{groups.length > 1 ? "s" : ""}, encore {money(left)} à acheter.
        </p>
      </div>
      <div className="tickets">
        {groups.map(([id, items]) => {
          const total = items.reduce((a, x) => a + Number(x.price || 0), 0);
          const got = items.filter((x) => x.done).length;
          const title = items[0]?.listTitle || items[0]?.recipe || "Liste de courses";
          return (
            <section className="ticket" key={id}>
              <header className="ticket-head">
                <span className="ticket-shop">eazy1000, Abidjan</span>
                <h2>{title}</h2>
                <span className="ticket-date">{fmt(items[0]?.createdAt)}</span>
              </header>
              <div className="ticket-progress" aria-label={`${got} sur ${items.length} dans le panier`}>
                <i style={{ width: (got / items.length) * 100 + "%" }} />
              </div>
              <ul className="ticket-lines">
                {items.map((x, i) => (
                  <li key={(x.id || i) + "-" + id}>
                    <button
                      className={x.done ? "done" : ""}
                      onClick={() => setCart(cart.map((y) => (y === x ? { ...y, done: !y.done } : y)))}
                      aria-pressed={x.done}
                    >
                      <span className="box" aria-hidden>
                        {x.done && <Check />}
                      </span>
                      <span className="line-name">
                        {x.name}
                        <small>{x.qty}</small>
                      </span>
                      <span className="leader" aria-hidden />
                      <span className="line-price">{money(x.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ticket-total">
                <span>Total</span>
                <b>{money(total)}</b>
              </div>
              <p className="ticket-count">
                {got === items.length ? "Tout est dans le panier. Bonne cuisine." : `${got} sur ${items.length} dans le panier`}
              </p>
              <div className="ticket-actions">
                <button className="btn btn-green" onClick={() => deliver(title, items.filter((x) => !x.done).map((x) => ({ name: x.name, estimated_price: x.price })))}>
                  <PackageOpen /> Faire livrer
                </button>
                <button
                  className="icon-btn"
                  aria-label="Supprimer ce ticket"
                  onClick={() => setCart(cart.filter((x) => (x.listId || "legacy") !== id))}
                >
                  <Trash2 />
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

/* ---------------------------- Garde-manger ---------------------------- */
export function PantryView({ items, rescan }: { items: Pantry[]; rescan: () => void }) {
  if (!items.length)
    return (
      <Empty
        image="empty-pantry"
        title="Que reste-t-il dans ta cuisine ?"
        text="Prends en photo ton frigo et tes placards. Eazy reconnaît les aliments et les utilise en priorité dans tes plans."
        action="Scanner mes aliments"
        go={rescan}
      />
    );
  return (
    <>
      <div className="hello compact">
        <h1>Ton garde-manger</h1>
        <p className="lead">{items.length} aliments reconnus. Eazy les cuisine avant d'en racheter.</p>
      </div>
      <ul className="pantry">
        {items.map((x, i) => (
          <li key={i}>
            <div>
              <b>{x.name}</b>
              <small>{x.quantity == null ? "Quantité à confirmer" : `${x.quantity} ${x.unit}`}</small>
            </div>
            <span className={`conf ${x.confidence >= 0.85 ? "high" : x.confidence >= 0.6 ? "mid" : "low"}`}>
              {x.confidence >= 0.85 ? "Sûr" : x.confidence >= 0.6 ? "Probable" : "À vérifier"}
            </span>
          </li>
        ))}
      </ul>
      <button className="btn btn-green" onClick={rescan}>
        Ajouter des photos
      </button>
    </>
  );
}

/* ---------------------------- Recette extraite d'une vidéo ---------------------------- */
export function VideoView({
  data,
  startCook,
  addCourses,
  deliver,
  openVideo,
}: {
  data: any;
  startCook: () => void;
  addCourses: () => void;
  deliver: () => void;
  openVideo: () => void;
}) {
  if (!data)
    return (
      <Empty
        image="feat-video"
        title="Aucune vidéo analysée."
        text="Colle le lien d'une vidéo de cuisine TikTok, Instagram ou YouTube : Eazy en tire la recette, les quantités et les étapes."
        action="Analyser une vidéo"
        go={openVideo}
      />
    );
  const rec = data.recipe || {};
  return (
    <>
      <div className="hello compact">
        <p>Recette tirée d'une vidéo</p>
        <h1>{rec.title || "Recette"}</h1>
        <p className="lead">
          Pour {rec.servings || 2} personnes{rec.servings_source === "source" ? ", comme dans la vidéo" : ""}.
        </p>
      </div>
      <div className="stack">
        <button className="btn btn-green" onClick={startCook}>
          <Play /> Cuisiner pas à pas
        </button>
        <div className="row2">
          <button className="btn btn-line" onClick={addCourses}>
            <ShoppingBasket /> Liste de courses
          </button>
          <button className="btn btn-line" onClick={deliver}>
            <PackageOpen /> Faire livrer
          </button>
        </div>
      </div>
      <h3 className="h-section">Ingrédients</h3>
      <ul className="pantry">
        {(data.ingredients || []).map((x: any, i: number) => (
          <li key={i}>
            <div>
              <b>{x.name}</b>
              <small>
                {x.recipe_quantity ?? x.quantity ?? "Quantité à ajuster"} {x.recipe_unit || x.unit || ""}
                {x.commercial_quantity ? `, acheter ${x.commercial_quantity} ${x.commercial_unit || ""}` : ""}
              </small>
            </div>
          </li>
        ))}
      </ul>
      <h3 className="h-section">Étapes</h3>
      <ol className="steps">
        {(data.steps || []).map((x: any, i: number) => (
          <li key={i}>
            <p>{x.instruction}</p>
            {x.timer_seconds && <small>{Math.ceil(x.timer_seconds / 60)} min</small>}
          </li>
        ))}
      </ol>
    </>
  );
}
