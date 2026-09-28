import {NextResponse} from "next/server";
export const runtime="nodejs";
export const maxDuration=60;
const BASE="https://api.poyo.ai";
const MODEL="nano-banana-2-new";
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const errText=(x:any)=>x?.message||x?.error?.message||x?.error||x?.msg||"Erreur PoYo";
export async function POST(req:Request){
 const started=Date.now();
 try{
  const {title}=await req.json();
  if(!title||typeof title!=="string")return NextResponse.json({error:"missing_title"},{status:400});
  const key=process.env.POYO_API_KEY?.trim();
  if(!key)return NextResponse.json({error:"provider_not_configured",message:"POYO_API_KEY absente en Production."},{status:503});
  const prompt=`Photographie culinaire photoréaliste et appétissante du plat suivant : "${title}". Présentation fidèle au plat réel, ingrédients visuellement cohérents, assiette complète, lumière naturelle chaude, photographie éditoriale premium, vue trois-quarts légèrement plongeante, profondeur de champ douce, arrière-plan sobre, aucun humain, aucun texte, aucun logo. Format carré pour une carte mobile Eazy 1000.`;
  const headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"};
  const submit=await fetch(BASE+"/api/generate/submit",{method:"POST",headers,body:JSON.stringify({model:MODEL,input:{prompt,size:"1:1"}}),cache:"no-store"});
  const raw=await submit.text();let job:any={};try{job=JSON.parse(raw)}catch{job={message:raw.slice(0,500)}}
  console.log("[meal-image] submit",{title,model:MODEL,status:submit.status,ok:submit.ok,ms:Date.now()-started,provider:submit.ok?"accepted":errText(job)});
  if(!submit.ok)return NextResponse.json({error:"image_provider_submit",provider_status:submit.status,message:errText(job),model:MODEL},{status:502});
  const taskId=job?.data?.task_id||job?.task_id||job?.data?.id||job?.id;
  if(!taskId){console.error("[meal-image] missing task id",JSON.stringify(job).slice(0,1000));return NextResponse.json({error:"missing_task_id",model:MODEL},{status:502})}
  for(let i=0;i<45;i++){
   await sleep(900);
   const poll=await fetch(BASE+"/api/generate/status/"+encodeURIComponent(taskId),{headers:{"Authorization":"Bearer "+key},cache:"no-store"});
   const pollRaw=await poll.text();let state:any={};try{state=JSON.parse(pollRaw)}catch{state={message:pollRaw.slice(0,500)}}
   if(!poll.ok){console.error("[meal-image] poll http error",{taskId,status:poll.status,message:errText(state)});return NextResponse.json({error:"image_provider_poll",provider_status:poll.status,message:errText(state),task_id:taskId},{status:502})}
   const data=state?.data||state;const status=String(data?.status||data?.state||"").toLowerCase();
   if(["finished","completed","success","succeeded"].includes(status)){
    const url=data?.output?.files?.[0]?.url||data?.output?.images?.[0]?.url||data?.output?.[0]?.url||data?.result?.urls?.[0]||data?.result?.images?.[0]?.url||data?.result?.url||data?.image_url||data?.url;
    console.log("[meal-image] finished",{title,taskId,hasUrl:!!url,ms:Date.now()-started});
    if(url)return NextResponse.json({image:url,model:MODEL,task_id:taskId,elapsed_ms:Date.now()-started});
    console.error("[meal-image] finished without url",JSON.stringify(data).slice(0,1500));
    return NextResponse.json({error:"missing_image_url",task_id:taskId,model:MODEL},{status:502});
   }
   if(["failed","error","cancelled","canceled"].includes(status)){console.error("[meal-image] generation failed",{title,taskId,message:errText(data)});return NextResponse.json({error:"generation_failed",message:errText(data),task_id:taskId,model:MODEL},{status:502})}
  }
  console.error("[meal-image] timeout",{title,taskId,ms:Date.now()-started});
  return NextResponse.json({error:"generation_timeout",task_id:taskId,model:MODEL},{status:504});
 }catch(e:any){console.error("[meal-image] exception",e?.message);return NextResponse.json({error:"image_failed",message:e?.message||"Erreur inconnue"},{status:502})}
}