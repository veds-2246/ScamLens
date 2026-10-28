import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request:Request){
 const url=new URL(request.url),code=url.searchParams.get("code"),requestedNext=url.searchParams.get("next");
 const next=requestedNext?.startsWith("/")&&!requestedNext.startsWith("//")?requestedNext:"/app";
 if(code){const supabase=await createClient();const {error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,url.origin));}
 return NextResponse.redirect(new URL("/auth/sign-in?error=confirmation",url.origin));
}
