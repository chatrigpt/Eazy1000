export type PantryItem={name:string;quantity:number|null;unit:string;confidence:number};
export type PlanInput={budget?:number;people?:number;days?:number;goal?:string;health?:string[];preferences?:string[];pantry?:PantryItem[]};

const OR="https://openrouter.ai/api/v1/chat/completions";
export async function openRouterJSON(system:string,user:any,images:string[]=[]){
 const key=process.env.OPENROUTER_API_KEY;if(!key) return null;
 const model=process.env.OPENROUTER_MODEL||"google/gemini-2.5-flash";
 const content:any[]=[{type:"text",text:typeof user==="string"?user:JSON.stringify(user)}];
 images.forEach(url=>content.push({type:"image_url",image_url:{url}}));
 const r=await fetch(OR,{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json","HTTP-Referer":process.env.APP_URL||"http://localhost:3000","X-Title":"Eazy 1000"},body:JSON.stringify({model,temperature:.2,response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content}]})});
 if(!r.ok)throw new Error("OpenRouter "+r.status+": "+await r.text());
 const j=await r.json();const raw=j.choices?.[0]?.message?.content;if(!raw)throw new Error("OpenRouter returned no content");
 return JSON.parse(raw.replace(/^\`\`\`json\s*|\`\`\`$/g,""));
}
export function demoPantry():PantryItem[]{return[{name:"Tomates",quantity:4,unit:"pièces",confidence:.97},{name:"Oignons",quantity:3,unit:"pièces",confidence:.95},{name:"Poulet",quantity:600,unit:"g",confidence:.88},{name:"Riz",quantity:1.2,unit:"kg",confidence:.94},{name:"Huile",quantity:300,unit:"ml",confidence:.72}]}
export function demoPlan(i:PlanInput){return{mode:"demo",summary:{budget:i.budget||15000,people:i.people||2,days:i.days||4,goal:i.goal||"Manger mieux",estimated_total:13750,saved_by_pantry:3850},meals:[{title:"Kédjénou de poulet revisité",day:1,meal:"Dîner",estimated_cost:3200,match:94},{title:"Attiéké poisson & légumes",day:2,meal:"Déjeuner",estimated_cost:2850,match:92},{title:"Omelette légumes-avocat",day:2,meal:"Dîner",estimated_cost:2100,match:89},{title:"Mafé léger & riz",day:3,meal:"Déjeuner",estimated_cost:2900,match:91}],shopping:[{name:"Poisson",qty:"500 g",estimated_price:2000},{name:"Avocat",qty:"2",estimated_price:800},{name:"Aubergines",qty:"3",estimated_price:500}],notice:"Démonstration : prix indicatifs. Les contraintes de santé ne remplacent pas un avis médical."}}
