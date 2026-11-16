"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock3,
  CookingPot,
  Droplets,
  Flame,
  Lock,
  Pause,
  Play,
  Plus,
  RotateCw,
  Scissors,
  Unlock,
  Utensils,
  X,
} from "lucide-react";
import { img } from "../app/lib/images";

const PHASE: Record<string, string> = { prep: "Mise en place", cook: "Cuisson", plate: "Dressage" };

/** Mode cuisine pas à pas : un geste par écran, minuteur intégré. */
export function CookingMode({ data, close }: { data: any; close: () => void }) {
  const steps = data.steps || [];
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const step = steps[idx] || {};
  const initial = Math.max(0, Number(step.timer_seconds || 0));
  const [left, setLeft] = useState(initial);

  useEffect(() => {
    setLeft(Math.max(0, Number((steps[idx] || {}).timer_seconds || 0)));
    setLocked(false);
    setPaused(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    if (!left || locked || paused) return;
    const t = setInterval(
      () =>
        setLeft((v) => {
          if (v <= 1) {
            clearInterval(t);
            if (idx < steps.length - 1) setTimeout(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), 180);
            return 0;
          }
          return v - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, locked, paused, left > 0]);

  if (finished)
    return (
      <div className="cook">
        <div className="cook-done">
          <img className="done-plate" src={img("cook-done", 750)} alt="" />
          <img className="done-gombo" src={img("gombo-cheers", 384)} alt="" />
          <h1>Bon appétit.</h1>
          <p>{data.recipe?.title ? `${data.recipe.title} est prêt.` : "Ton plat est prêt."} Partage-le, il le mérite.</p>
          <button className="btn btn-green" onClick={close}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );

  if (!steps.length)
    return (
      <div className="cook">
        <div className="cook-top">
          <button className="icon-btn" onClick={close} aria-label="Fermer">
            <X />
          </button>
        </div>
        <div className="cook-copy">
          <h1>Les étapes ne sont pas disponibles pour ce plat.</h1>
        </div>
      </div>
    );

  const heat = step.heat || {};
  const phase = step.phase || (step.inferred ? "prep" : "cook");
  const scene = String(step.scene_type || "other");
  const Visual =
    scene.includes("cut") || scene.includes("chop")
      ? Scissors
      : scene === "prep_wash"
        ? Droplets
        : scene === "mix"
          ? RotateCw
          : ["fry", "sear", "simmer", "boil"].includes(scene)
            ? Flame
            : CookingPot;
  const progress = ((idx + 1) / steps.length) * 100;

  return (
    <div className="cook">
      <div className="cook-top">
        <button className="icon-btn" onClick={close} aria-label="Quitter le mode cuisine">
          <X />
        </button>
        <div className="cook-progress">
          <i style={{ width: progress + "%" }} />
        </div>
        <span className="cook-count">
          {idx + 1} sur {steps.length}
        </span>
      </div>

      <div className={`cook-stage phase-${phase}`}>
        <div className="cook-orb" aria-hidden>
          <Visual />
        </div>
        <span className="cook-phase">
          {PHASE[phase] || "Cuisson"}
          {step.inferred ? ", ajouté par Eazy" : ""}
        </span>
        <strong>{step.action_title || step.movement || "Préparer"}</strong>
      </div>

      <div className="cook-copy">
        <h1>{step.instruction}</h1>

        {(step.ingredient_actions || []).length > 0 && (
          <ul className="cook-ings">
            {step.ingredient_actions.map((a: any, i: number) => (
              <li key={i}>
                <b>{a.ingredient}</b>
                <small>
                  {a.quantity != null ? `${a.quantity} ${a.unit || ""}` : "Selon besoin"}
                  {a.prep_shape ? `, ${a.prep_shape}` : ""}
                </small>
              </li>
            ))}
          </ul>
        )}

        <div className="hud">
          {step.tool && (
            <div>
              <Utensils />
              <span>
                <small>Ustensile</small>
                <b>{step.tool}</b>
              </span>
            </div>
          )}
          {heat.enabled && (
            <div>
              <Flame />
              <span>
                <small>Feu</small>
                <b>{heat.intensity || (heat.temperature_c ? heat.temperature_c + " °C" : "À ajuster")}</b>
              </span>
            </div>
          )}
          {initial > 0 && (
            <div className="hud-timer">
              <Clock3 />
              <span>
                <small>Minuteur</small>
                <b>
                  {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
                </b>
              </span>
            </div>
          )}
        </div>

        {initial > 0 && (
          <div className="timer-ctl">
            <button onClick={() => setPaused(!paused)}>
              {paused ? <Play /> : <Pause />}
              {paused ? "Reprendre" : "Pause"}
            </button>
            <button onClick={() => setLeft((v) => v + 30)}>
              <Plus /> 30 s
            </button>
            <button className={locked ? "on" : ""} onClick={() => setLocked(!locked)}>
              {locked ? <Lock /> : <Unlock />}
              {locked ? "Étape manuelle" : "Étape auto"}
            </button>
          </div>
        )}

        {step.expected_result && (
          <div className="ready">
            <Check />
            <span>
              <small>C'est prêt quand</small>
              <b>{step.expected_result}</b>
            </span>
          </div>
        )}
      </div>

      <div className="cook-nav">
        <button className="btn btn-line" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          <ChevronLeft /> Précédent
        </button>
        <button className="btn btn-green" onClick={() => (idx === steps.length - 1 ? setFinished(true) : setIdx((i) => i + 1))}>
          {idx === steps.length - 1 ? "Plat terminé" : "C'est fait"} <ArrowRight />
        </button>
      </div>
    </div>
  );
}
