import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function AppLayout({children}:{children:React.ReactNode}) {
 if(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){
  const supabase=await createClient();
  const {data,error}=await supabase.auth.getClaims();
  if(error||!data?.claims?.sub)redirect("/auth/sign-in?next=%2Fapp");
 }
 return children;
}
