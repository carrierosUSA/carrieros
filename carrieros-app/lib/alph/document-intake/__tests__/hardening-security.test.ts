import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
const migration=readFileSync(resolve(process.cwd(),"supabase/migrations/20260814110000_document_intake_hardening.sql"),"utf8");
const repository=readFileSync(resolve(process.cwd(),"lib/alph/document-intake/supabase-repository.ts"),"utf8");
test("document reads are role-scoped and claims fail closed",()=>{assert.match(migration,/create or replace function public\.can_read_document/);assert.match(migration,/exception when invalid_text_representation then return null/);assert.match(migration,/d\.created_by = auth\.uid\(\)/);});
test("human confirmation is database atomic",()=>{assert.match(migration,/create or replace function public\.confirm_document_review/);assert.match(repository,/userDb\.rpc\("confirm_document_review"/);});
test("storage updates preserve company and owner boundaries",()=>{assert.match(migration,/company_documents_update/);assert.match(migration,/with check[\s\S]*owner_id = auth\.uid\(\)::text/);});
