const required=["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","OPENAI_API_KEY","TRANSPO_EXPECTED_SUPABASE_PROJECT_REF"];
const serverSecrets=["SUPABASE_SERVICE_ROLE_KEY","SUPABASE_JWT_SECRET","DATABASE_URL","DIRECT_URL","OPENAI_API_KEY","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","TWILIO_AUTH_TOKEN","SMTP_PASSWORD","CRON_SECRET"];
const failures=[];
if(process.env.TRANSPO_ENVIRONMENT?.trim().toLowerCase()!=="development")failures.push("TRANSPO_ENVIRONMENT must equal development");
for(const name of required){const value=process.env[name]?.trim();if(!value||/YOUR_|example|placeholder/i.test(value))failures.push(`${name} is missing or still a placeholder`)}
for(const name of serverSecrets)if(process.env[`NEXT_PUBLIC_${name}`])failures.push(`NEXT_PUBLIC_${name} must be removed`);
const expected=process.env.TRANSPO_EXPECTED_SUPABASE_PROJECT_REF?.trim().toLowerCase()||"",url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()||"";
if(expected&&!/^[a-z0-9]{20}$/.test(expected))failures.push("TRANSPO_EXPECTED_SUPABASE_PROJECT_REF must be a 20-character Supabase project reference");
let actual="";try{const parsed=new URL(url);if(parsed.protocol!=="https:"||!parsed.hostname.endsWith(".supabase.co"))throw new Error();actual=parsed.hostname.slice(0,-".supabase.co".length).toLowerCase()}catch{if(url)failures.push("NEXT_PUBLIC_SUPABASE_URL must be an HTTPS Supabase project URL")}
if(expected&&actual&&expected!==actual)failures.push("Supabase URL does not match TRANSPO_EXPECTED_SUPABASE_PROJECT_REF");
if(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY===process.env.SUPABASE_SERVICE_ROLE_KEY)failures.push("Anonymous and service-role credentials must not be identical");
if(failures.length){console.error("Development target preflight failed:");for(const failure of failures)console.error(`- ${failure}`);console.error("No database action was performed.");process.exit(1)}
console.log("Development target preflight passed: explicit development marker, exact project-reference match, required services, and secret-name boundaries verified. No credential values printed and no database action performed.");
