"use client";

import { X } from "lucide-react";
import { img } from "../app/lib/images";

export function Wordmark() {
  return (
    <span className="wordmark">
      eazy<b>1000</b>
    </span>
  );
}

/** Feuille qui monte du bas de l'écran (recette, plan, livraison…). */
export function Sheet({
  children,
  close,
  label,
  tall = false,
}: {
  children: React.ReactNode;
  close: () => void;
  label: string;
  tall?: boolean;
}) {
  return (
    <div className="sheet-wrap" onClick={close}>
      <div
        className={`sheet ${tall ? "sheet-tall" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="grabber" aria-hidden />
        <button className="sheet-close" onClick={close} aria-label="Fermer">
          <X />
        </button>
        {children}
      </div>
    </div>
  );
}

/** Écran d'attente avec le gombo qui inspecte la marmite. */
export function Busy({ label }: { label: string }) {
  const l = label.toLowerCase();
  const sub = l.includes("plan")
    ? "Il choisit des plats adaptés à ta santé et à ton régime, au prix du marché."
    : l.includes("vidéo")
      ? "Il note chaque ingrédient et chaque geste."
      : l.includes("étapes")
        ? "Il découpe la recette en gestes simples."
        : "Il reconnaît ce que tu as déjà.";
  return (
    <div className="busy" role="status" aria-live="polite">
      <img src={img("gombo-think", 384)} alt="" />
      <strong>{label}</strong>
      <span>{sub}</span>
      <div className="busy-dots" aria-hidden>
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function Toast({ text }: { text: string }) {
  return (
    <div className="toast" role="status">
      {text}
    </div>
  );
}

export function Counter({
  label,
  value,
  set,
  min,
  max,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="counter">
      <span>{label}</span>
      <div>
        <button onClick={() => set(Math.max(min, value - 1))} aria-label={`Moins de ${label.toLowerCase()}`}>
          −
        </button>
        <b>{value}</b>
        <button onClick={() => set(Math.min(max, value + 1))} aria-label={`Plus de ${label.toLowerCase()}`}>
          +
        </button>
      </div>
    </div>
  );
}

export function Empty({
  image,
  title,
  text,
  action,
  go,
}: {
  image: string;
  title: string;
  text: string;
  action?: string;
  go?: () => void;
}) {
  return (
    <div className="empty">
      <img src={img(image, 384)} alt="" />
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <button className="btn btn-green" onClick={go}>
          {action}
        </button>
      )}
    </div>
  );
}
