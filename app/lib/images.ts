// Illustrations Eazy 1000 — générées avec POYO (GPT Image 2), palette « Marché d'Adjamé »,
// hébergées sur Google Drive (dossier « Eazy1000 – illustrations », partagé par lien).
// lh3.googleusercontent.com sert l'image et la redimensionne avec le suffixe =wN.
const IDS: Record<string, string> = {
  "plan-week": "13DuKOd1lXxvVRomcy9hTN8oohHZkXzdH",
  "ob-market": "13hThNB4CpDqKLKEn7JawEmTNtdSe9FDp",
  "ob-delivery": "1wJwY4rniSN0430QchCUc1BeGgBgu5Nro",
  "feat-scan": "1w9RjP96e-Hem-0vMKNOyxywP0FJO9G4W",
  "feat-video": "1s7HCdtwn2y_PN7jzaWjHKXbsxrMxv1qJ",
  "feat-plan": "14XuPDEi3U0BLPz2KSMSjU2TD0FkKqFhQ",
  "empty-cart": "1MkEMsrnXq_jegeriQuoqtXMEi1jyABfh",
  "empty-pantry": "1taBrioUwXwQ7R2CwykFd7EV5otWBikJ_",
  "cook-done": "1-OPc2wHs2e1kWLQh0O6YmFEvOCIM-nfF",
  "gombo-cheers": "1xSFLQyzx3XmLhOomL21bPJenJhxoBwR3",
  "gombo-think": "1HCo6Z__1WrQx7ZSH2hDJRhJLVqddV3Vm",
};

export function img(name: string, width = 750): string {
  const id = IDS[name];
  if (!id) return "";
  const w = Math.min(1400, Math.round(width * 1.5));
  return `https://lh3.googleusercontent.com/d/${id}=w${w}`;
}
