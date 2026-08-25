import "server-only";
import { getSupabaseAuthenticatedUserClient } from "@/lib/supabase/server";
export type DriverProfile = { id:string; driverUserId:string; displayName:string; cdlState:string; cdlLastFour:string; cdlExpiresOn:string; medicalCardExpiresOn:string; hiredOn?:string; status:"active"|"leave"|"suspended"|"terminated"; verifiedAt:string };
export type DriverAccountOption = { userId:string; displayName:string };
type Row=Record<string,unknown>; const text=(value:unknown)=>typeof value==="string"?value:"";
export class DriverProfilesRepository {
  async workspace(accessToken:string):Promise<{profiles:DriverProfile[];accounts:DriverAccountOption[]}>{
    const db=getSupabaseAuthenticatedUserClient(accessToken); const [profilesResult,accountsResult]=await Promise.all([db.rpc("list_verified_driver_profiles"),db.rpc("list_unprofiled_company_drivers")]);
    if(profilesResult.error)throw new Error("Authorized driver profiles are unavailable.");
    const profiles=(Array.isArray(profilesResult.data)?profilesResult.data:[]).flatMap((value):DriverProfile[]=>{if(!value||typeof value!=="object")return[];const row=value as Row;const id=text(row.profile_id);const status=text(row.status);if(!id||!["active","leave","suspended","terminated"].includes(status))return[];return[{id,driverUserId:text(row.driver_user_id),displayName:text(row.display_name)||"Verified driver",cdlState:text(row.cdl_state),cdlLastFour:text(row.cdl_last_four),cdlExpiresOn:text(row.cdl_expires_on),medicalCardExpiresOn:text(row.medical_card_expires_on),hiredOn:text(row.hired_on)||undefined,status:status as DriverProfile["status"],verifiedAt:text(row.verified_at)}]});
    const accounts=accountsResult.error?[]:(Array.isArray(accountsResult.data)?accountsResult.data:[]).flatMap((value):DriverAccountOption[]=>{if(!value||typeof value!=="object")return[];const row=value as Row;const userId=text(row.user_id);return userId?[{userId,displayName:text(row.display_name)||"Verified driver"}]:[]});
    return{profiles,accounts};
  }
}
