"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Home, PackageOpen, ShoppingBasket } from "lucide-react";
import type { Recipe } from "./data";
import { EazyAPI } from "../lib/api-client";
import { budgetFor, DEFAULT_PROFILE, loadProfile, saveProfile, type Profile } from "./lib/profile";
import type { Cart, Meal, Pantry, PlanResult } from "./types";
import { Busy, Toast } from "../components/ui";
import { FoyerSetup, Onboarding } from "../components/Welcome";
import { CartView, PantryView, PlanView, TodayView, VideoView } from "../components/Views";
import { DeliverySheet, MealSheet, PlannerSheet, RecipeSheet, VideoSheet } from "../components/Sheets";
import { CookingMode } from "../components/Cooking";

type Screen = "loading" | "onboarding" | "setup" | "edit-foyer" | "app";

const TABS = [
  { id: "home", label: "Aujourd'hui", Icon: Home },
  { id: "plan", label: "Mon plan", Icon: CalendarDays },
  { id: "cart", label: "Courses", Icon: ShoppingBasket },
  { id: "pantry", label: "Garde-manger", Icon: PackageOpen },
];

const save = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

export default function Page() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [tab, setTab] = useState("home");

  // Paramètres du prochain plan (pré-remplis depuis le foyer)
  const [budget, setBudget] = useState(15000);
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(4);
  const [goal, setGoal] = useState("Manger mieux");
  const [mealSlots, setMealSlots] = useState<string[]>(["Déjeuner", "Dîner"]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [diet, setDiet] = useState<string[]>([]);
  const [health, setHealth] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [planner, setPlanner] = useState(false);
  const [videoSheet, setVideoSheet] = useState(false);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [pantry, setPantry] = useState<Pantry[]>([]);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [video, setVideo] = useState<any>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [cart, setCart] = useState<Cart[]>([]);
  const [planMeal, setPlanMeal] = useState<Meal | null>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [cookData, setCookData] = useState<any>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    try {
      setPantry(JSON.parse(localStorage.getItem("eazy1000-pantry") || "[]"));
      setPlan(JSON.parse(localStorage.getItem("eazy1000-plan") || "null"));
      setVideo(JSON.parse(localStorage.getItem("eazy1000-video-result") || "null"));
      setCart(JSON.parse(localStorage.getItem("eazy1000-cart") || "[]"));
    } catch {}
    setScreen(p.onboarded ? "app" : "onboarding");
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const flash = (x: string) => {
    setToast(x);
    setTimeout(() => setToast(""), 2400);
  };
  const updateCart = (next: Cart[]) => {
    setCart(next);
    save("eazy1000-cart", next);
  };
  const stampItems = (items: any[], title: string) => {
    const createdAt = new Date().toISOString();
    const listId = "list-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    return items.map((x) => ({ ...x, listId, createdAt, listTitle: title }));
  };

  const openPlanner = () => {
    setPeople(profile.people);
    setGoal(profile.goal);
    setMealSlots(profile.mealSlots);
    setCuisines(profile.cuisines);
    setDiet(profile.diet || []);
    setHealth(profile.health || []);
    setNotes(profile.notes || "");
    setBudget(budgetFor(profile.weeklyBudget, days));
    setPlanner(true);
  };
  const changeDays = (d: number) => {
    setDays(d);
    setBudget(budgetFor(profile.weeklyBudget, d));
  };

  /* ---------- Actions (logique d'origine conservée) ---------- */
  const scan = async (fs: FileList | null) => {
    if (!fs?.length) return;
    setBusy("Eazy analyse tes aliments");
    try {
      const imgs = await Promise.all(
        Array.from(fs)
          .slice(0, 6)
          .map(
            (f) =>
              new Promise<string>((ok, ko) => {
                const r = new FileReader();
                r.onload = () => ok(String(r.result));
                r.onerror = () => ko(r.error);
                r.readAsDataURL(f);
              }),
          ),
      );
      const out: any = await EazyAPI.scanPantry(imgs);
      setPantry(out.items || []);
      save("eazy1000-pantry", out.items || []);
      setTab("pantry");
      flash((out.items?.length || 0) + " aliments ajoutés au garde-manger");
    } catch (e: any) {
      flash("Analyse impossible : " + e.message);
    } finally {
      setBusy("");
      if (scanRef.current) scanRef.current.value = "";
    }
  };

  const generate = async () => {
    if (!mealSlots.length) return flash("Choisis au moins un repas");
    if (!cuisines.length) return flash("Choisis au moins un type de cuisine");
    setPlanner(false);
    setBusy("Eazy compose ton plan sur mesure");
    try {
      const start_date = new Date().toISOString().slice(0, 10);
      const all = ["Africaine", "Occidentale", "Asiatique", "Arabe"];
      const out: any = await EazyAPI.createMealPlan({
        budget,
        people,
        days,
        goal,
        pantry,
        start_date,
        meal_slots: mealSlots,
        cuisines_included: cuisines,
        cuisines_excluded: all.filter((x) => !cuisines.includes(x)),
        preferences: [...diet, ...(notes.trim() ? [`Allergies ou aliments interdits : ${notes.trim()}`] : [])],
        health,
      });
      // Les choix faits dans le planificateur deviennent le profil par défaut
      const nextProfile = { ...profile, diet, health, notes, people, goal, mealSlots, cuisines };
      setProfile(nextProfile);
      saveProfile(nextProfile);
      out.meals = (out.meals || []).map((m: Meal) => ({ ...m, imageLoading: true }));
      setPlan(out);
      save("eazy1000-plan", out);
      setTab("plan");
      flash("Plan prêt. Eazy illustre les plats.");
      Promise.allSettled(
        out.meals.map(async (m: Meal, i: number) => {
          let image: string | undefined;
          try {
            const pic: any = await EazyAPI.mealImage(m.title);
            image = pic.image;
          } catch {}
          setPlan((cur) => {
            if (!cur) return cur;
            const next = { ...cur, meals: cur.meals.map((x, n) => (n === i ? { ...x, image, imageLoading: false } : x)) };
            save("eazy1000-plan", next);
            return next;
          });
        }),
      );
    } catch (e: any) {
      flash("Plan impossible : " + e.message);
    } finally {
      setBusy("");
    }
  };

  const analyzeVideo = async (url: string) => {
    setVideoSheet(false);
    setBusy("Eazy regarde la vidéo");
    try {
      let out: any = await EazyAPI.videoRecipe(url);
      if (out.status === "queued" && out.requestId) {
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          out = await EazyAPI.videoStatus(out.requestId);
          if (out.status !== "IN_QUEUE" && out.status !== "IN_PROGRESS") break;
        }
      }
      setVideo(out);
      save("eazy1000-video-result", out);
      setTab("video");
      flash("Recette extraite de la vidéo");
    } catch (e: any) {
      flash("Vidéo : " + e.message);
    } finally {
      setBusy("");
    }
  };

  const addRecipe = (r: Recipe) => {
    const items = r.ingredients
      .filter((i) => !cart.some((c) => c.id === r.id + "-" + i.name))
      .map((i) => ({ ...i, id: r.id + "-" + i.name, recipe: r.name, done: false }));
    updateCart([...cart, ...stampItems(items, r.name)]);
    setSelected(null);
    setTab("cart");
    flash("Ingrédients ajoutés à tes courses");
  };

  const mealItems = (m: Meal, prefix: string) =>
    (m.ingredients || [])
      .filter((x) => !x.pantry_match)
      .map((x, i) => ({
        name: x.name,
        qty: String(x.quantity || "à prévoir") + " " + (x.unit || ""),
        price: x.checkout_price ?? x.estimated_price ?? null,
        id: prefix + "-" + m.title + "-" + Date.now() + "-" + i,
        recipe: m.title,
        done: false,
      }));

  const coursesMeal = (m: Meal) => {
    const items = mealItems(m, "meal") as any[];
    updateCart([...cart, ...stampItems(items, m.title)]);
    setPlanMeal(null);
    setTab("cart");
    flash(items.length ? `Ticket créé, ${items.length} ingrédients` : "Tu as déjà tous les ingrédients");
  };

  const addAllPlan = () => {
    const items = (plan?.shopping || []).map((x: any, i: number) => ({
      name: x.name,
      qty: String(x.quantity || "à prévoir") + " " + (x.unit || ""),
      price: x.checkout_price ?? x.estimated_price ?? null,
      id: "plan-" + i + "-" + x.name,
      recipe: "Plan Eazy",
      done: false,
    }));
    updateCart([...cart, ...stampItems(items, `Plan de ${days} jour${days > 1 ? "s" : ""}`)]);
    setTab("cart");
    flash("Ticket de courses du plan créé");
  };

  const cookMeal = async (m: Meal) => {
    setPlanMeal(null);
    if (m.steps?.length) return setCookData({ recipe: { title: m.title, servings: people }, steps: m.steps });
    setBusy("Eazy prépare les étapes de cuisine");
    try {
      const cooked: any = await EazyAPI.cookPlan(m, profile.people);
      setCookData(cooked);
    } catch (e: any) {
      flash("Recette interactive : " + e.message);
    } finally {
      setBusy("");
    }
  };

  const videoCourses = () => {
    const items = (video?.ingredients || []).map((x: any, i: number) => ({
      name: x.name,
      qty: (x.commercial_quantity || x.recipe_quantity || x.quantity || "à prévoir") + " " + (x.commercial_unit || x.recipe_unit || x.unit || ""),
      price: x.estimated_price || 0,
      id: "video-" + i + "-" + x.name,
      recipe: video?.recipe?.title || "Recette vidéo",
      done: false,
    }));
    updateCart([...cart, ...stampItems(items, video?.recipe?.title || "Recette vidéo")]);
    setTab("cart");
  };

  /* ---------- Écrans ---------- */
  if (screen === "loading") return <main className="app" />;
  if (screen === "onboarding") return <Onboarding done={() => setScreen("setup")} />;
  if (screen === "setup" || screen === "edit-foyer")
    return (
      <FoyerSetup
        initial={profile}
        cancel={screen === "edit-foyer" ? () => setScreen("app") : () => setScreen("onboarding")}
        save={(p) => {
          setProfile(p);
          saveProfile(p);
          setScreen("app");
          if (screen === "setup") flash("Foyer enregistré. Planifions ta semaine.");
        }}
      />
    );

  return (
    <main className="app">
      {toast && <Toast text={toast} />}
      {busy && <Busy label={busy} />}
      <input hidden ref={scanRef} multiple type="file" accept="image/*" onChange={(e) => scan(e.target.files)} />

      <section className="screen">
        {tab === "home" && (
          <TodayView
            profile={profile}
            plan={plan}
            pantry={pantry}
            video={video}
            editFoyer={() => setScreen("edit-foyer")}
            openPlanner={openPlanner}
            scan={() => scanRef.current?.click()}
            openVideo={() => setVideoSheet(true)}
            openRecipe={setSelected}
            openMeal={setPlanMeal}
            cookMeal={cookMeal}
            goTab={setTab}
          />
        )}
        {tab === "plan" && (
          <PlanView
            profile={profile}
            editFoyer={() => setScreen("edit-foyer")}
            plan={plan}
            regenerate={openPlanner}
            openMeal={setPlanMeal}
            prepareMeal={cookMeal}
            coursesMeal={coursesMeal}
            addAll={addAllPlan}
            deliver={() => setDelivery({ title: "Courses du plan", items: plan?.shopping || [] })}
          />
        )}
        {tab === "cart" && (
          <CartView cart={cart} setCart={updateCart} deliver={(title, items) => setDelivery({ title, items })} openPlanner={openPlanner} />
        )}
        {tab === "pantry" && <PantryView items={pantry} rescan={() => scanRef.current?.click()} />}
        {tab === "video" && (
          <VideoView
            data={video}
            startCook={() => setCookData(video)}
            addCourses={videoCourses}
            deliver={() => setDelivery({ title: video?.recipe?.title || "Recette vidéo", items: video?.ingredients || [] })}
            openVideo={() => setVideoSheet(true)}
          />
        )}
      </section>

      <nav className="tabbar" aria-label="Navigation">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)} aria-current={tab === id}>
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {planner && (
        <PlannerSheet
          budget={budget}
          setBudget={setBudget}
          people={people}
          setPeople={setPeople}
          days={days}
          setDays={changeDays}
          goal={goal}
          setGoal={setGoal}
          mealSlots={mealSlots}
          setMealSlots={setMealSlots}
          cuisines={cuisines}
          setCuisines={setCuisines}
          diet={diet}
          setDiet={setDiet}
          health={health}
          setHealth={setHealth}
          notes={notes}
          setNotes={setNotes}
          close={() => setPlanner(false)}
          run={generate}
        />
      )}
      {videoSheet && <VideoSheet close={() => setVideoSheet(false)} analyze={analyzeVideo} />}
      {selected && <RecipeSheet r={selected} close={() => setSelected(null)} add={() => addRecipe(selected)} />}
      {planMeal && (
        <MealSheet
          meal={planMeal}
          close={() => setPlanMeal(null)}
          cook={() => cookMeal(planMeal)}
          add={() => coursesMeal(planMeal)}
          deliver={() => {
            setDelivery({ title: planMeal.title, items: (planMeal.ingredients || []).filter((x) => !x.pantry_match) });
            setPlanMeal(null);
          }}
        />
      )}
      {cookData && <CookingMode data={cookData} close={() => setCookData(null)} />}
      {delivery && (
        <DeliverySheet
          order={delivery}
          close={() => setDelivery(null)}
          confirm={(store) => {
            flash("Panier préparé chez " + store);
            setDelivery(null);
          }}
        />
      )}
    </main>
  );
}
