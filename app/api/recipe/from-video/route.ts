import {NextResponse} from "next/server";
import {openRouterJSON} from "../../../../lib/eazy-ai";
export const runtime="nodejs";
export const maxDuration=60;

type Segment={text:string;offset?:number;duration?:number};
const normalizeContent=(content:unknown):Segment[]=>{
 if(Array.isArray(content)) return content.map((x:any)=>({text:String(x?.text||""),offset:Number(x?.offset||0),duration:Number(x?.duration||0)})).filter(x=>x.text);
 if(typeof content==="string") return [{text:content,offset:0,duration:0}];
 return [];
};

export async function POST(req:Request){
 try{
  const {videoUrl}=await req.json();
  if(!videoUrl)return NextResponse.json({error:"video_url_required"},{status:400});
  if(!process.env.SUPADATA_API_KEY)return NextResponse.json({error:"supadata_not_configured",message:"SUPADATA_API_KEY absente de l'environnement Production."},{status:503});
  if(!process.env.OPENROUTER_API_KEY)return NextResponse.json({error:"openrouter_not_configured",message:"OPENROUTER_API_KEY absente de l'environnement Production."},{status:503});

  const endpoint=new URL("https://api.supadata.ai/v1/transcript");
  endpoint.searchParams.set("url",videoUrl);
  const sr=await fetch(endpoint,{headers:{"x-api-key":process.env.SUPADATA_API_KEY},cache:"no-store"});
  const rawText=await sr.text();
  let transcript:any;
  try{transcript=JSON.parse(rawText)}catch{transcript={raw:rawText}}
  if(!sr.ok) return NextResponse.json({error:"supadata_failed",message:transcript?.message||transcript?.details||rawText,status:sr.status},{status:502});

  const segments=normalizeContent(transcript.content);
  if(!segments.length)return NextResponse.json({error:"transcript_empty",message:"Supadata n'a retourné aucun contenu exploitable pour cette vidéo."},{status:422});

  const normalized=await openRouterJSON(
   `Tu es le moteur culinaire Eazy 1000. Transforme cette transcription horodatée en recette exécutable. RÈGLE PORTIONS: si la source mentionne explicitement un nombre de personnes/portions, utilise-le; sinon servings=2 et adapte les quantités explicites quand c'est raisonnablement calculable. N'invente jamais de nouvel ingrédient ni de quantité factuelle absente. En revanche, complète la recette avec les ÉTAPES TECHNIQUES IMPLICITES indispensables à une exécution réelle: laver, éplucher, parer, découper, émincer, hacher, préchauffer, égoutter, réserver, etc. Déduis une forme/taille de découpe culinairement cohérente quand elle est nécessaire à la cuisson (ex: viande à frire -> morceaux/cubes réguliers adaptés), sans prétendre qu'elle était dite dans la source. Marque toute étape ajoutée inferred=true et explique brièvement inferred_reason. Une étape source a inferred=false.

Retourne STRICTEMENT ce JSON:
{"recipe":{"title":"","servings":2,"servings_source":"default|source","estimated_time_min":null,"source_url":""},
"ingredients":[{"name":"","recipe_quantity":null,"recipe_unit":"","confidence":0,"commercial_quantity":null,"commercial_unit":null,"units_to_buy":null,"estimated_price":null}],
"steps":[{"order":1,"phase":"prep|cook|plate","scene_type":"prep_cut|prep_wash|prep_peel|prep_chop|preheat|add|mix|fry|sear|boil|simmer|bake|rest|drain|plate|other","action_title":"","instruction":"","expected_result":null,"inferred":false,"inferred_reason":null,"ingredient_actions":[{"ingredient":"","quantity":null,"unit":"","action":"","prep_shape":null}],"movement":null,"tool":null,"heat":{"enabled":false,"intensity":null,"temperature_c":null},"timer_seconds":null,"auto_advance":true,"video_timestamp_start":null,"video_timestamp_end":null}],
"uncertainties":[]}.
Les commercial_* sont une préparation pour le moteur courses: ne fabrique ni conditionnement ni prix si le transcript ne les donne pas. Les timestamps sont en secondes à partir de offset/duration en millisecondes. Chaque étape doit avoir phase, scene_type et action_title. Regroupe d'abord la mise en place (prep), puis la cuisson (cook), puis le dressage (plate) quand pertinent. expected_result décrit un résultat observable utile: "cubes réguliers de 2–3 cm", "oignons translucides", "sauce légèrement épaissie". Ne donne pas un temps comme unique critère quand un signe visuel est plus utile. Décris movement comme un geste de cuisine court et concret uniquement s'il est déductible (remuer, fouetter, retourner, pétrir, émincer...). Pour une préparation réellement exécutable, préfère des étapes atomiques plutôt qu'une phrase qui combine 5 actions. Réponds en français.`,
   {source_url:videoUrl,language:transcript.lang||null,segments}
  );
  if(!normalized)return NextResponse.json({error:"normalization_failed",message:"OpenRouter n'a pas produit de recette structurée."},{status:502});
  return NextResponse.json({...normalized,source:{provider:"supadata",language:transcript.lang||null,segments:segments.length}});
 }catch(e:any){return NextResponse.json({error:"video_failed",message:e.message},{status:502})}
}
