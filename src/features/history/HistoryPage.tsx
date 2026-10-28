"use client";
import { useEffect, useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { clearHistory, deleteHistory, getHistory, replaceHistory } from "@/lib/localStorage";
import { syncCloudHistory } from "@/lib/supabase/history";
import { downloadJsonReport, downloadReport, printReport, shareReport } from "@/lib/exportReport";
import type { HistoryEntry } from "@/types/history";
export default function HistoryPage() {
 const [entries,setEntries]=useState<HistoryEntry[]>([]),[sharedId,setSharedId]=useState<string|null>(null),[selected,setSelected]=useState<HistoryEntry|null>(null),[syncState,setSyncState]=useState<"local"|"syncing"|"synced">("local");
 useEffect(()=>{
  let cancelled=false;
  const refresh=()=>setEntries(getHistory());
  refresh();
  void (async()=>{setSyncState("syncing");try{const merged=await syncCloudHistory(getHistory());if(!cancelled&&merged){replaceHistory(merged);setEntries(merged);setSyncState("synced");}else if(!cancelled)setSyncState("local");}catch{if(!cancelled)setSyncState("local");}})();
  window.addEventListener("scamlens-storage",refresh);window.addEventListener("storage",refresh);
  return()=>{cancelled=true;window.removeEventListener("scamlens-storage",refresh);window.removeEventListener("storage",refresh);};
 },[]);
 function removeAll(){clearHistory();setEntries([]);setSelected(null);}
 return <div className="view-stack">
  <div className="page-intro"><div><p className="eyebrow">Your trail / 04</p><h1>Local history, on your terms.</h1><p className="intro-copy">Saved reports stay on this browser and sync to your account when signed in.</p></div><span className="tech-label">{syncState==="syncing"?"SYNCING HISTORY":syncState==="synced"?"CLOUD SYNC READY":"LOCAL HISTORY"}</span></div>
  <Card><div className="card-heading"><div><p className="eyebrow">Saved checks</p><h2>{entries.length? `${entries.length} recent report${entries.length===1?"":"s"}`:"No saved checks yet"}</h2></div>{entries.length>0&&<Button variant="secondary" type="button" onClick={removeAll}>Clear history</Button>}</div>
   {entries.length?<div className="history-list">{entries.map(entry=><article className="history-item" key={entry.id}><div className="history-item-main"><p className="eyebrow">{entry.kind} · {new Date(entry.createdAt).toLocaleDateString()}</p><h3>{entry.label}</h3><p className="supporting-text">{entry.result.summary}</p></div><div className="history-actions"><Badge tone={entry.riskLevel==="high"?"high":entry.riskLevel==="medium"?"warning":"teal"}>{entry.riskLevel} · {entry.score}</Badge><Button variant="secondary" type="button" onClick={()=>setSelected(selected?.id===entry.id?null:entry)}>{selected?.id===entry.id?"Close report":"Open"}</Button><Button variant="secondary" type="button" onClick={()=>downloadReport(entry)}>TXT</Button><Button variant="secondary" type="button" onClick={()=>downloadJsonReport(entry)}>JSON</Button><Button variant="secondary" type="button" onClick={()=>printReport(entry)}>Print / Save PDF</Button><Button variant="secondary" type="button" onClick={async()=>{if(await shareReport(entry))setSharedId(entry.id);}}>{sharedId===entry.id?"Copied":"Share"}</Button><Button variant="secondary" type="button" onClick={()=>{deleteHistory(entry.id);setEntries(getHistory());if(selected?.id===entry.id)setSelected(null);}}>Delete</Button></div>{selected?.id===entry.id&&<div className="history-detail" aria-live="polite"><Card><div className="history-detail-heading"><div><p className="eyebrow">Report detail</p><h2>{selected.label}</h2></div><Button variant="secondary" type="button" onClick={()=>setSelected(null)}>Close</Button></div><p className="body-copy">{selected.result.summary}</p><p className="limitation-note">{selected.result.limitation}</p></Card></div>}</article>)}</div>:<p className="supporting-text">Run a message or URL check and it will appear here. Saving is local and can be cleared at any time.</p>}
  </Card></div>;
}
