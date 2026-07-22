-- Guarded rollback for 20260721100000_document_pickup_numbers.sql.
-- Refuses to remove a schema that contains or has produced pickup-number data.

begin;

do $$
declare
  has_pickup_rows boolean := false;
  has_pickup_ocr_results boolean := false;
  has_pickup_actions boolean := false;
begin
  if to_regclass('public.document_pickup_numbers') is not null then
    execute $query$
      select exists (
        select 1
        from public.document_pickup_numbers
        limit 1
      )
    $query$ into has_pickup_rows;
  end if;

  if to_regclass('public.document_ocr_results') is not null then
    execute $query$
      select exists (
        select 1
        from public.document_ocr_results
        where prompt_version = 'document-intake-v3-pickup-numbers'
        limit 1
      )
    $query$ into has_pickup_ocr_results;
  end if;

  if to_regclass('public.document_proposed_actions') is not null then
    execute $query$
      select exists (
        select 1
        from public.document_proposed_actions
        where payload ? 'pickup_number_count'
        limit 1
      )
    $query$ into has_pickup_actions;
  end if;

  if has_pickup_rows then
    raise exception
      'Rollback refused: public.document_pickup_numbers contains records.';
  end if;

  if has_pickup_ocr_results then
    raise exception
      'Rollback refused: pickup-number OCR results exist, including possible zero-number results.';
  end if;

  if has_pickup_actions then
    raise exception
      'Rollback refused: pickup-number proposed actions exist.';
  end if;

  if to_regclass('public.document_pickup_numbers') is not null then
    execute
      'drop policy if exists document_pickup_numbers_company_select
       on public.document_pickup_numbers';
    execute 'drop table public.document_pickup_numbers';
  end if;
end
$$;

alter table if exists public.document_ocr_results
  drop constraint if exists document_ocr_results_company_document_id_unique;

commit;
