// Illustrations générées (GPT Image 2 via POYO), palette « Marché d'Adjamé », optimisées par Vercel.
const IDS: Record<string, string> = {
  "gombo-wave": "FG2YQ7QORRVLGHAS",
  "gombo-head": "6WSM76S7VRZP68QD",
  "gombo-cheers": "K0JT6U9TA9I6HKLK",
  "gombo-think": "MV5AHRQT0SFU7SDN",
  "ob-market": "3HJAPMKYS22KJLP2",
  "ob-scan": "PQIMYMVQKI8ZUSX5",
  "ob-delivery": "XG2LAYWLRA5IYDDF",
  "plan-week": "SR5GRLF8ZX66B6QG",
  "feat-scan": "JOGQK7G4ZENYN015",
  "feat-video": "AWOAT76Y9YBESG2M",
  "feat-plan": "H818ZB37RRVWWS13",
  "empty-cart": "TAFF7AKTFEKLM0UH",
  "empty-pantry": "J3IL290U80VO1QZS",
  "cook-done": "XV70AA6Y6E3FSM7Y",
};

const ALLOWED_W = [256, 384, 640, 750, 828, 1080];

export function img(name: string, width = 750): string {
  const id = IDS[name];
  if (!id) return "";
  const src = `https://cdn.doculator.org/images/${id}/${id}.png`;
  const w = ALLOWED_W.find((x) => x >= width) ?? 1080;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=78`;
}
