import type { HistoryEntry } from "@/types/history";
import { createClient } from "@/lib/supabase/client";
type HistoryRow={id:string;user_id:string;kind:"message"|"url";created_at:string;label:string;risk_level:HistoryEntry["riskLevel"];score:number;result:HistoryEntry["result"];input:string|null};
function toRow(entry:HistoryEntry,userId:string):HistoryRow{return{id:entry.id,user_id:userId,kind:entry.kind,created_at:entry.createdAt,label:entry.label,risk_level:entry.riskLevel,score:entry.score,result:entry.result,input:entry.input??null};}
function fromRow(row:HistoryRow):HistoryEntry{return{id:row.id,kind:row.kind,createdAt:row.created_at,label:row.label,riskLevel:row.risk_level,score:row.score,result:row.result,...(row.input?{input:row.input}:{})};}
export async function saveCloudHistory(entry:HistoryEntry):Promise<boolean>{const supabase=createClient();if(!supabase)return false;const {data:{user}}=await supabase.auth.getUser();if(!user)return false;const {error}=await supabase.from("analysis_history").upsert(toRow(entry,user.id),{onConflict:"id"});return !error;}
export async function syncCloudHistory(localEntries:HistoryEntry[]):Promise<HistoryEntry[]|null>{
 const supabase=createClient();if(!supabase)return null;const {data:{user},error:userError}=await supabase.auth.getUser();if(userError||!user)return null;
 for(const entry of localEntries)await saveCloudHistory(entry);
 const {data,error}=await supabase.from("analysis_history").select("id,user_id,kind,created_at,label,risk_level,score,result,input").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50);
 if(error||!data)return null;return(data as HistoryRow[]).map(fromRow);
}
export async function deleteCloudHistory(id:string){const supabase=createClient();if(!supabase)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;await supabase.from("analysis_history").delete().eq("id",id).eq("user_id",user.id);}
export async function clearCloudHistory(){const supabase=createClient();if(!supabase)return;const {data:{user}}=await supabase.auth.getUser();if(!user)return;await supabase.from("analysis_history").delete().eq("user_id",user.id);}
