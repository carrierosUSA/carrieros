"use server";
import { revalidatePath } from "next/cache";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import type { BusinessRole } from "@/lib/auth/roles";
import { DriverProfilesRepository, type DriverAccountOption, type DriverProfile } from "@/lib/drivers/profiles";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const READ=new Set<BusinessRole>(["super_admin","owner","dispatcher","safety"]);const WRITE=new Set<BusinessRole>(["super_admin","owner","safety"]);
type Result={ok:true;profiles:DriverProfile[];accounts:DriverAccountOption[];canManage:boolean}|{ok:false;error:string};
async function authorize(write=false){const auth=await requireDocumentAuth();if(!(write?WRITE:READ).has(auth.businessRole))throw new Error("unauthorized");return auth;}
export async function getDriverProfilesAction():Promise<Result>{try{const auth=await authorize();const data=await new DriverProfilesRepository().workspace(auth.accessToken);return{ok:true,...data,canManage:WRITE.has(auth.businessRole)}}catch{return{ok:false,error:"Driver compliance is restricted to authorized operational and safety roles."}}}
export async function saveVerifiedDriverProfileAction(input:{profileId?:string|null;driverUserId:string;cdlState:string;cdlLastFour:string;cdlExpiresOn:string;medicalCardExpiresOn:string;hiredOn?:string|null;status:DriverProfile["status"];note?:string|null;requestId:string}):Promise<Result>{
  const state=input.cdlState.trim().toUpperCase();const lastFour=input.cdlLastFour.trim().toUpperCase();const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
  if((input.profileId&&!UUID.test(input.profileId))||!UUID.test(input.driverUserId)||!UUID.test(input.requestId)||!(/^[A-Z]{2}$/.test(state))||!(/^[0-9A-Z]{4}$/.test(lastFour))||!validDate(input.cdlExpiresOn)||!validDate(input.medicalCardExpiresOn)||(input.hiredOn&&!validDate(input.hiredOn)))return{ok:false,error:"Enter a verified driver account, CDL state/last four, and valid compliance dates."};
  try{const auth=await authorize(true);const db=getSupabaseAuthenticatedUserClient(auth.accessToken);const result=await db.rpc("save_verified_driver_profile",{p_profile_id:input.profileId??null,p_driver_user_id:input.driverUserId,p_cdl_state:state,p_cdl_last_four:lastFour,p_cdl_expires_on:input.cdlExpiresOn,p_medical_card_expires_on:input.medicalCardExpiresOn,p_hired_on:input.hiredOn||null,p_status:input.status,p_note:input.note?.trim().slice(0,2000)||null,p_request_id:input.requestId});if(result.error)return{ok:false,error:"Driver profile could not be saved. Verify the same-company driver account and factual fields."};revalidatePath("/drivers");const data=await new DriverProfilesRepository().workspace(auth.accessToken);return{ok:true,...data,canManage:true};}catch{return{ok:false,error:"Driver profile was not saved. No compliance state changed."}}
}
