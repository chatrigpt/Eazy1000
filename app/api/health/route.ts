import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({ok:true,service:"eazy1000-api",providers:{openrouter:Boolean(process.env.OPENROUTER_API_KEY),fal:Boolean(process.env.FAL_KEY)},mode:process.env.OPENROUTER_API_KEY?"live":"demo",time:new Date().toISOString()})}
