"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck, LockKeyhole } from "@/components/LucideIcons";
import { createClient } from "@/lib/supabase/client";
import "../landing.css";
import "./landing-auth.css";
function AuthFormInner({mode}:{mode:"sign-in"|"sign-up"}) {
 const router=useRouter(), searchParams=useSearchParams();
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const isSignUp=mode==="sign-up";
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");setMessage("");setBusy(true);
  const supabase=createClient();
  if(!supabase){setError("Supabase is not configured yet. Add the project URL and publishable key to .env.local.");setBusy(false);return;}
  try{
   if(isSignUp){
    const {data,error:authError}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/auth/callback?next=/app`}});
    if(authError)throw authError;
    if(data.session){router.replace("/app");router.refresh();}else setMessage("Account created. Check your email for the confirmation link, then sign in.");
   }else{
    const {error:authError}=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(authError)throw authError;
    const next=searchParams.get("next");router.replace(next?.startsWith("/")&&!next.startsWith("//")?next:"/app");router.refresh();
   }
  }catch(e){setError(e instanceof Error?e.message:"Authentication failed. Please try again.");}finally{setBusy(false);}
 }
 return <main className="auth-screen"><Link href="/" className="landing-brand auth-brand"><span className="brand-symbol"><ShieldCheck size={22}/></span><span>ScamLens<span className="brand-dot">.</span></span></Link><div className="auth-layout"><div className="auth-aside"><span className="section-kicker">YOUR EVERYDAY SCAM-SAFETY COMPANION</span><h1>A little more<br/><span>certainty.</span></h1><p>Build a calmer habit around suspicious messages and links. Your reports stay tied to your account when you choose cloud history.</p><div className="auth-privacy"><LockKeyhole size={18}/><span><b>Your space, your reports</b><small>Private account access with user-scoped history.</small></span></div></div><section className="auth-card"><span className="auth-card-icon"><ShieldCheck size={23}/></span><p className="section-kicker">{isSignUp?"GET STARTED":"WELCOME BACK"}</p><h2>{isSignUp?"Create your account":"Sign in to ScamLens"}</h2><p className="auth-subtitle">{isSignUp?"Save your reports and pick up where you left off.":"Your next careful check is just a moment away."}</p><form onSubmit={submit} className="auth-form"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={isSignUp?"new-password":"current-password"} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/>{error&&<p className="auth-error" role="alert">{error}</p>}{message&&<p className="auth-success" role="status">{message}</p>}<button className="button auth-submit" type="submit" disabled={busy}>{busy?"Please wait…":isSignUp?"Create account":"Sign in"} <ArrowRight size={17}/></button></form><p className="auth-switch">{isSignUp?"Already registered?":"New to ScamLens?"} <Link href={isSignUp?"/auth/sign-in":"/auth/sign-up"}>{isSignUp?"Sign in":"Create an account"}</Link></p><p className="auth-terms">ScamLens is an educational aid, not a guarantee that a message or link is safe.</p></section></div><footer className="auth-footer"><span>© {new Date().getFullYear()} ScamLens</span><Link href="/">Back to home</Link></footer></main>;
}
export default function AuthForm({mode}:{mode:"sign-in"|"sign-up"}){return <Suspense fallback={<main className="auth-screen"><div className="auth-loading">Loading secure sign-in…</div></main>}><AuthFormInner mode={mode}/></Suspense>;}
