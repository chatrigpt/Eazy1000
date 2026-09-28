import {NextResponse} from "next/server";
export const runtime="nodejs";
const MODEL="gemini-3.1-flash-lite-image";
export async function POST(req:Request){
 try{
  const {title}=await req.json();
  if(!title||typeof title!=="string")return NextResponse.json({error:"missing_title"},{status:400});
  const key=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY;
  if(!key)return NextResponse.json({error:"provider_not_configured",message:"GEMINI_API_KEY absente."},{status:503});
  const prompt=`Photographie culinaire photoréaliste et appétissante du plat suivant : "${title}". Présentation fidèle au plat réel, ingrédients visuellement cohérents, assiette complète, lumière naturelle chaude, photographie éditoriale premium, vue trois-quarts légèrement plongeante, profondeur de champ douce, arrière-plan sobre, aucun humain, aucun texte, aucun logo. Format carré pensé pour une carte d'application mobile de cuisine en Afrique francophone.`;
  const res=await fetch("https://generativelanguage.googleapis.com/v1beta/interactions",{method:"POST",headers:{"x-goog-api-key":key,"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,input:prompt,response_format:{type:"image",aspect_ratio:"1:1"}})});
  const json=await res.json();
  if(!res.ok)return NextResponse.json({error:"image_provider_error",message:json?.error?.message||"Génération image impossible"},{status:502});
  const img=json?.output_image;
  if(!img?.data)return NextResponse.json({error:"no_image"},{status:502});
  return NextResponse.json({image:`data:${img.mime_type||"image/png"};base64,${img.data}`,model:MODEL});
 }catch(e:any){return NextResponse.json({error:"image_failed",message:e.message},{status:502})}
}