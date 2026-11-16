"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { img } from "../app/lib/images";
import { CUISINES, GOALS, SLOTS, type Profile } from "../app/lib/profile";
import { money } from "../app/types";
import { Counter, Wordmark } from "./ui";

const SLIDES = [
  {
    img: "ob-market",
    title: "Bien manger, sans se ruiner.",
    text: "Eazy compose tes repas de la semaine avec les vrais prix des marchés et supermarchés d'Abidjan, pour rester dans ton budget.",
  },
  {
    img: "ob-scan",
    title: "Photographie ton frigo, Eazy cuisine avec.",
    text: "Il reconnaît ce que tu as déjà et te propose des plats qui l'utilisent. Moins de gaspillage, moins de dépenses.",
  },
  {
    img: "ob-delivery",
    title: "Tes courses, au franc près.",
    text: "Une liste claire comme un ticket de caisse, à cocher au marché, ou à faire livrer chez toi en un geste.",
  },
];

export function Onboarding({ done }: { done: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];
  return (
    <main className="app onboarding">
      <header className="ob-top">
        <Wordmark />
        {!last && (
          <button className="text-btn" onClick={done}>
            Passer
          </button>
        )}
      </header>
      <div className="ob-body" key={i}>
        <figure className="ob-frame">
          <img src={img(s.img, 828)} alt="" />
        </figure>
        <h1>{s.title}</h1>
        <p>{s.text}</p>
      </div>
      <footer className="ob-foot">
        <div className="dots" aria-label={`Écran ${i + 1} sur ${SLIDES.length}`}>
          {SLIDES.map((_, k) => (
            <span key={k} className={k === i ? "on" : ""} />
          ))}
        </div>
        <button className="btn btn-green" onClick={() => (last ? done() : setI(i + 1))}>
          {last ? "Configurer mon foyer" : "Suivant"}
        </button>
      </footer>
    </main>
  );
}

const STEPS = ["people", "budget", "goal", "cuisines", "slots"] as const;

export function FoyerSetup({
  initial,
  save,
  cancel,
}: {
  initial: Profile;
  save: (p: Profile) => void;
  cancel?: () => void;
}) {
  const [p, setP] = useState<Profile>(initial);
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const set = (x: Partial<Profile>) => setP((v) => ({ ...v, ...x }));
  const toggle = (key: "cuisines" | "mealSlots", v: string) =>
    set({ [key]: p[key].includes(v) ? p[key].filter((y) => y !== v) : [...p[key], v] } as Partial<Profile>);
  const ok =
    (cur === "cuisines" && p.cuisines.length > 0) ||
    (cur === "slots" && p.mealSlots.length > 0) ||
    !["cuisines", "slots"].includes(cur);

  return (
    <main className="app setup">
      <header className="setup-top">
        {(step > 0 || cancel) && (
          <button className="icon-btn" onClick={() => (step ? setStep(step - 1) : cancel?.())} aria-label="Retour">
            ‹
          </button>
        )}
        <div className="progress" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>
          {STEPS.map((_, k) => (
            <span key={k} className={k <= step ? "on" : ""} />
          ))}
        </div>
      </header>

      <section className="setup-body" key={cur}>
        {cur === "people" && (
          <>
            <h1>Tu cuisines pour combien de personnes ?</h1>
            <p className="sub">Les quantités et les prix seront calculés pour tout ton foyer.</p>
            <div className="big-counter">
              <Counter label="Personnes" value={p.people} set={(n) => set({ people: n })} min={1} max={12} />
            </div>
          </>
        )}
        {cur === "budget" && (
          <>
            <h1>Quel budget courses par semaine ?</h1>
            <p className="sub">Eazy s'en sert pour choisir les plats et les quantités. Tu pourras l'ajuster à chaque plan.</p>
            <div className="budget-pick">
              <b>{money(p.weeklyBudget)}</b>
              <input
                type="range"
                min={5000}
                max={150000}
                step={1000}
                value={p.weeklyBudget}
                onChange={(e) => set({ weeklyBudget: Number(e.target.value) })}
                aria-label="Budget par semaine"
              />
              <div className="range-ends">
                <span>5 000 F</span>
                <span>150 000 F</span>
              </div>
              <p className="hint">
                Environ {money(p.weeklyBudget / 7 / p.people)} par personne et par jour.
              </p>
            </div>
          </>
        )}
        {cur === "goal" && (
          <>
            <h1>Ce qui compte le plus pour toi ?</h1>
            <p className="sub">Un seul choix. Il oriente les plats proposés.</p>
            <div className="choices">
              {GOALS.map((g) => (
                <button key={g} className={`choice ${p.goal === g ? "on" : ""}`} onClick={() => set({ goal: g })} aria-pressed={p.goal === g}>
                  <span>{g}</span>
                  <i className="tick radio" aria-hidden>
                    {p.goal === g && <Check />}
                  </i>
                </button>
              ))}
            </div>
          </>
        )}
        {cur === "cuisines" && (
          <>
            <h1>Quelles cuisines aimes-tu ?</h1>
            <p className="sub">Décoche celles que tu ne veux jamais voir dans tes plans.</p>
            <div className="choices">
              {CUISINES.map((c) => (
                <button key={c} className={`choice ${p.cuisines.includes(c) ? "on" : ""}`} onClick={() => toggle("cuisines", c)} aria-pressed={p.cuisines.includes(c)}>
                  <span>Cuisine {c.toLowerCase()}</span>
                  <i className="tick" aria-hidden>
                    {p.cuisines.includes(c) && <Check />}
                  </i>
                </button>
              ))}
            </div>
          </>
        )}
        {cur === "slots" && (
          <>
            <h1>Quels repas veux-tu planifier ?</h1>
            <p className="sub">Eazy proposera un plat pour chacun, chaque jour.</p>
            <div className="choices">
              {SLOTS.map((s) => (
                <button key={s} className={`choice ${p.mealSlots.includes(s) ? "on" : ""}`} onClick={() => toggle("mealSlots", s)} aria-pressed={p.mealSlots.includes(s)}>
                  <span>{s}</span>
                  <i className="tick" aria-hidden>
                    {p.mealSlots.includes(s) && <Check />}
                  </i>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="setup-foot">
        <button
          className="btn btn-green"
          disabled={!ok}
          onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : save({ ...p, onboarded: true }))}
        >
          {step < STEPS.length - 1 ? "Continuer" : "C'est mon foyer"}
        </button>
      </footer>
    </main>
  );
}
