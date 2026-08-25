"use server";
import{requireDocumentAuth}from"@/lib/auth/supabase-server";import{CommandCenterRepository,type CommandCenterData}from"@/lib/command-center/dashboard";
export async function getCommandCenterAction():Promise<{ok:true;data:CommandCenterData}|{ok:false;error:string}>{try{const auth=await requireDocumentAuth();const data=await new CommandCenterRepository().get({companyId:auth.companyId,accessToken:auth.accessToken,role:auth.businessRole});return{ok:true,data}}catch{return{ok:false,error:"Authorized command-center data is not available."}}}
