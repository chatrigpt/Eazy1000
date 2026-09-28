import {NextResponse} from "next/server";import {demoPantry,openRouterJSON} from "../../../../lib/eazy-ai";
export const runtime="nodejs";
export async function POST(req:Request){try{const b=await req.json();const images=Array.isArray(b.images)?b.images.slice(0,6):[];if(!images.length)return NextResponse.json({error:"images_required"},{status:400});
 const system=`Tu es Eazy Vision. Analyse des photos de garde-manger. Réponds UNIQUEMENT en JSON: {"items":[{"name":"string","quantity":number|null,"unit":"string","confidence":0.0}],"uncertain_items":[]}. Fusionne les doublons entre photos. N'invente jamais une quantité invisible; mets null. confidence entre 0 et 1.`;
 const ai=await openRouterJSON(system,"Identifie les aliments visibles et estime uniquement ce qui est raisonnablement visible.",images);
 return NextResponse.json(ai||{mode:"demo",items:demoPantry(),uncertain_items:[]});}catch(e:any){return NextResponse.json({error:"scan_failed",message:e.message},{status:502})}}
