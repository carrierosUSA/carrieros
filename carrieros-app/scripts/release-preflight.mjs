const required=["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","OPENAI_API_KEY"];
const secretNames=["SUPABASE_SERVICE_ROLE_KEY","SUPABASE_JWT_SECRET","DATABASE_URL","DIRECT_URL","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","OPENAI_API_KEY","ANTHROPIC_API_KEY","AZURE_OPENAI_API_KEY","VERYFI_CLIENT_ID","VERYFI_CLIENT_SECRET","AZURE_FORM_RECOGNIZER_KEY","TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","SENDGRID_API_KEY","AWS_SECRET_ACCESS_KEY","S3_SECRET_ACCESS_KEY","SMTP_PASSWORD","WEBHOOK_SIGNING_SECRET","CRON_SECRET"];
const failures=[];
for(const name of required){const value=process.env[name]?.trim();if(!value||/YOUR_|example|placeholder/i.test(value))failures.push(`${name} is missing or still a placeholder`)}
for(const name of secretNames)if(process.env[`NEXT_PUBLIC_${name}`])failures.push(`NEXT_PUBLIC_${name} must be removed`);
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;if(url&&!/^https:\/\/[a-z0-9]{20}\.supabase\.co\/?$/i.test(url))failures.push("NEXT_PUBLIC_SUPABASE_URL must be an HTTPS Supabase project URL with an exact project reference");
if(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY===process.env.SUPABASE_SERVICE_ROLE_KEY)failures.push("Anonymous and service-role credentials must not be identical");
if((process.env.ALPH_OCR_PROVIDER??"openai")!=="openai")failures.push("ALPH_OCR_PROVIDER must be openai for a release");
const max=Number(process.env.ALPH_DOCUMENT_MAX_BYTES??15728640);if(!Number.isInteger(max)||max<1||max>15728640)failures.push("ALPH_DOCUMENT_MAX_BYTES must be an integer from 1 through 15728640");
const bucket=(process.env.ALPH_DOCUMENT_BUCKET??"company-documents").trim();if(bucket.length<3||bucket.length>100||!/^[a-z0-9][a-z0-9._-]*$/i.test(bucket))failures.push("ALPH_DOCUMENT_BUCKET is invalid");
if(failures.length){console.error("Release preflight failed:");for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log("Release preflight passed: required services configured, no known public-secret aliases found, production OCR enforced, and document limits valid.");
