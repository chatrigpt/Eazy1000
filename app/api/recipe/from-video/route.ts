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
   `Tu es le moteur d'extraction culinaire d'Eazy 1000. À partir d'une transcription horodatée d'une vidéo sociale, produis strictement un JSON: {"recipe":{"title":"","servings":null,"estimated_time_min":null,"source_url":""},"ingredients":[{"name":"","quantity":null,"unit":"","confidence":0}],"steps":[{"order":1,"instruction":"","estimated_duration_min":null,"video_timestamp_start":null,"video_timestamp_end":null}],"uncertainties":[]}. Utilise offset et duration (millisecondes) pour les timestamps en secondes. N'invente jamais une quantité non dite. Si une information dépend uniquement de l'image et n'est pas dans la transcription, ajoute-la aux uncertainties. Réponds en français.`,
   {source_url:videoUrl,language:transcript.lang||null,segments}
  );
  if(!normalized)return NextResponse.json({error:"normalization_failed",message:"OpenRouter n'a pas produit de recette structurée."},{status:502});
  return NextResponse.json({...normalized,source:{provider:"supadata",language:transcript.lang||null,segments:segments.length}});
 }catch(e:any){return NextResponse.json({error:"video_failed",message:e.message},{status:502})}
}
