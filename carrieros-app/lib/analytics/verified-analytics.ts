import "server-only";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";

export type AnalyticsPoint={date:string;delivered:number;revenueCents?:number};
export type VerifiedAnalytics={activeLoads:number;deliveredLast30Days:number;currentExceptions:number;onTimeDelivered:number;timedDeliveries:number;statusCounts:{status:string;count:number}[];trend:AnalyticsPoint[];financial?:{verifiedRateCents:number;invoicedCents:number;paidCents:number;outstandingCents:number;overdueCents:number}};
type Row=Record<string,unknown>;const rows=(v:unknown):Row[]=>Array.isArray(v)?v.filter((x):x is Row=>Boolean(x)&&typeof x==="object"):[];const text=(v:unknown)=>typeof v==="string"?v:"";const num=(v:unknown)=>Number.isFinite(Number(v))?Number(v):0;
export class VerifiedAnalyticsRepository{
  async get(input:{companyId:string;accessToken:string;financialAccess:boolean}):Promise<VerifiedAnalytics>{
    const db=getSupabaseAuthenticatedUserClient(input.accessToken);const cutoff=new Date(Date.now()-30*86400000).toISOString();
    const [loadsResult,stopsResult,eventsResult,financialsResult]=await Promise.all([
      db.from("loads").select("id,status,exception_summary").eq("company_id",input.companyId).limit(5000),
      db.from("load_stops").select("load_id,stop_type,stop_sequence,appointment_at").eq("company_id",input.companyId).limit(10000),
      db.from("load_events").select("load_id,event_type,status,event_at").eq("company_id",input.companyId).eq("event_type","status_changed").gte("event_at",cutoff).limit(10000),
      input.financialAccess?db.from("load_financials").select("load_id,rate_cents,invoice_number,payment_status,paid_cents,expected_payment_at").eq("company_id",input.companyId).limit(5000):Promise.resolve({data:[],error:null}),
    ]);
    if(loadsResult.error||stopsResult.error||eventsResult.error)throw new Error("Verified analytics are unavailable.");
    const loads=rows(loadsResult.data),stops=rows(stopsResult.data),events=rows(eventsResult.data),financials=financialsResult.error?[]:rows(financialsResult.data);
    const activeStatuses=new Set(["pending","dispatched","en_route_to_pickup","arrived_pickup","picked_up","in_transit","arrived_delivery"]);
    const deliveredEvents=events.filter((e)=>text(e.status)==="delivered");let onTime=0,timed=0;
    for(const event of deliveredEvents){const loadId=text(event.load_id);const deliveries=stops.filter((s)=>text(s.load_id)===loadId&&text(s.stop_type)==="delivery").sort((a,b)=>num(b.stop_sequence)-num(a.stop_sequence));const appointment=text(deliveries[0]?.appointment_at),deliveredAt=text(event.event_at);if(!appointment||!deliveredAt)continue;const appointmentTime=new Date(appointment).getTime(),deliveredTime=new Date(deliveredAt).getTime();if(Number.isNaN(appointmentTime)||Number.isNaN(deliveredTime))continue;timed+=1;if(deliveredTime<=appointmentTime)onTime+=1}
    const statusMap=new Map<string,number>();for(const load of loads){const status=text(load.status)||"unknown";statusMap.set(status,(statusMap.get(status)??0)+1)}
    const days=Array.from({length:30},(_,i)=>{const d=new Date();d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-(29-i));return d.toISOString().slice(0,10)});const deliveredByDate=new Map<string,number>();const revenueByDate=new Map<string,number>();const financialByLoad=new Map(financials.map((f)=>[text(f.load_id),f]));
    for(const event of deliveredEvents){const day=text(event.event_at).slice(0,10);deliveredByDate.set(day,(deliveredByDate.get(day)??0)+1);if(input.financialAccess)revenueByDate.set(day,(revenueByDate.get(day)??0)+num(financialByLoad.get(text(event.load_id))?.rate_cents))}
    const result:VerifiedAnalytics={activeLoads:loads.filter((l)=>activeStatuses.has(text(l.status))).length,deliveredLast30Days:deliveredEvents.length,currentExceptions:loads.filter((l)=>Boolean(text(l.exception_summary))).length,onTimeDelivered:onTime,timedDeliveries:timed,statusCounts:[...statusMap].map(([status,count])=>({status,count})).sort((a,b)=>b.count-a.count),trend:days.map((date)=>({date,delivered:deliveredByDate.get(date)??0,...(input.financialAccess?{revenueCents:revenueByDate.get(date)??0}:{})}))};
    if(input.financialAccess){const now=Date.now();const verifiedRateCents=financials.reduce((s,f)=>s+num(f.rate_cents),0),invoicedCents=financials.reduce((s,f)=>s+(text(f.invoice_number)?num(f.rate_cents):0),0),paidCents=financials.reduce((s,f)=>s+num(f.paid_cents),0);result.financial={verifiedRateCents,invoicedCents,paidCents,outstandingCents:Math.max(0,invoicedCents-paidCents),overdueCents:financials.reduce((s,f)=>s+(text(f.payment_status)!=="paid"&&text(f.expected_payment_at)&&new Date(text(f.expected_payment_at)).getTime()<now?Math.max(0,num(f.rate_cents)-num(f.paid_cents)):0),0)}}
    return result;
  }
}
