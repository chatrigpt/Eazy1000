import {NextResponse} from "next/server";
export async function GET(){
 const providers={openrouter:Boolean(process.env.OPENROUTER_API_KEY),fal:Boolean(process.env.FAL_KEY),supadata:Boolean(process.env.SUPADATA_API_KEY)};
 return NextResponse.json({ok:true,service:"eazy1000-api",providers,videoPipeline:providers.supadata&&providers.openrouter?"live":"not-configured",mode:providers.openrouter?"live":"demo",time:new Date().toISOString()});
}
