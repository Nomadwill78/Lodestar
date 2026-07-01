-- =====================================================================
-- Lodestar / Vega  |  Migration 011: Member region for localized support
-- Adds an optional ISO 3166-1 alpha-2 country code on members so the
-- reframe function can return crisis resources for the member's locale.
-- Null means unknown, which the function maps to an international list.
-- =====================================================================

alter table members
  add column if not exists country_code text;

-- Light sanity guard: store a 2-letter uppercase code or nothing.
alter table members
  drop constraint if exists members_country_code_format;
alter table members
  add constraint members_country_code_format
  check (country_code is null or country_code ~ '^[A-Z]{2}$');
