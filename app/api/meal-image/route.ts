import {NextResponse} from "next/server";
export const runtime="nodejs";
const BASE="https://api.poyo.ai";
const MODEL="nano-banana-2-lite";
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export async function POST(req:Request){
 try{
  const {title}=await req.json();
  if(!title||typeof title!=="string")return NextResponse.json({error:"missing_title"},{status:400});
  const key=process.env.POYO_API_KEY;
  if(!key)return NextResponse.json({error:"provider_not_configured",message:"POYO_API_KEY absente."},{status:503});
  const prompt=`Photographie culinaire photoréaliste et appétissante du plat suivant : "${title}". Présentation fidèle au plat réel, ingrédients visuellement cohérents, assiette complète, lumière naturelle chaude, photographie éditoriale premium, vue trois-quarts légèrement plongeante, profondeur de champ douce, arrière-plan sobre, aucun humain, aucun texte, aucun logo. Format carré pour une carte mobile Eazy 1000.`;
  const headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"};
  const submit=await fetch(BASE+"/api/generate/submit",{method:"POST",headers,body:JSON.stringify({model:MODEL,input:{prompt,size:"1:1",resolution:"1K"}})});
  const job=await submit.json();
  if(!submit.ok)return NextResponse.json({error:"image_provider_error",message:job?.message||job?.error||"PoYo submit impossible"},{status:502});
  const taskId=job?.data?.task_id||job?.task_id;
  if(!taskId)return NextResponse.json({error:"missing_task_id"},{status:502});
  for(let i=0;i<30;i++){
   await sleep(1000);
   const poll=await fetch(BASE+"/api/generate/status?task_id="+encodeURIComponent(taskId),{headers:{"Authorization":"Bearer "+key}});
   const state=await poll.json();
   const data=state?.data||state;
   if(data?.status==="finished"||data?.status==="completed"||data?.status==="success"){
    const url=data?.output?.files?.[0]?.url||data?.output?.[0]?.url||data?.result?.urls?.[0]||data?.result?.url||data?.url;
    if(url)return NextResponse.json({image:url,model:MODEL,task_id:taskId});
   }
   if(data?.status==="failed"||data?.status==="error")return NextResponse.json({error:"generation_failed",message:data?.error||"PoYo generation failed"},{status:502});
  }
  return NextResponse.json({error:"generation_timeout",task_id:taskId},{status:504});
 }catch(e:any){return NextResponse.json({error:"image_failed",message:e.message},{status:502})}
}