import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
const repository=readFileSync(resolve(process.cwd(),"lib/operations/load-repository.ts"),"utf8");
test("load UI uses authenticated user client only",()=>{assert.match(repository,/getSupabaseAuthenticatedUserClient\(input\.accessToken\)/);assert.doesNotMatch(repository,/getSupabaseServerClient|service_role|SUPABASE_SERVICE_ROLE_KEY/);});
test("every operational read is company scoped",()=>{for(const table of ["loads","load_stops","load_assignments","load_events","load_financials"]){const reads=[...repository.matchAll(new RegExp(`from\\(\"${table}\"\\)\\.select\\(\"\\*\"\\)([^;]+)`,"g"))];assert.ok(reads.length>0);for(const read of reads)assert.match(read[1],/eq\("company_id", input\.companyId\)/);}});
test("financial denial stays non-leaking",()=>{assert.match(repository,/financialsResult\.error \? \[\] : rows/);assert.match(repository,/financialResult\.error \? null : row/);});
test("repository logs no operational data",()=>assert.doesNotMatch(repository,/console\./));
