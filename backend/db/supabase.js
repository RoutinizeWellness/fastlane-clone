/**
 * Supabase client module for Fastlane Clone backend.
 *
 * This is a HYBRID setup:
 *   - The existing SQLite (better-sqlite3) database continues to serve all
 *     current synchronous route handlers — nothing breaks.
 *   - This module provides an async Supabase client + helper functions so that
 *     new features (or a gradual migration) can talk to Supabase/PostgreSQL.
 *
 * Usage in routes:
 *   const { supabase, supabaseQuery, supabaseInsert } = require('../db/supabase');
 */

const { createClient } = require('@supabase/supabase-js');

// ---------------------------------------------------------------------------
// Initialise client
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Use the service-role key so the backend bypasses RLS.
// We pass a dummy key when unconfigured so the module can still be required
// without throwing — actual calls will fail gracefully at runtime.
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY || 'placeholder-key-not-configured',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ---------------------------------------------------------------------------
// Helper: isConfigured — true when real keys have been supplied
// ---------------------------------------------------------------------------

function isConfigured() {
  return (
    SUPABASE_URL !== 'https://your-project.supabase.co' &&
    SUPABASE_SERVICE_KEY !== '' &&
    SUPABASE_SERVICE_KEY !== 'your-service-role-key' &&
    SUPABASE_SERVICE_KEY !== 'your-anon-key'
  );
}

// ---------------------------------------------------------------------------
// Generic helpers that mirror common better-sqlite3 patterns
// ---------------------------------------------------------------------------

/**
 * SELECT helper — returns an array of rows (or single row when `single` is true).
 *
 * @param {string}   table              Table name
 * @param {object}   [options]
 * @param {string}   [options.columns]  Comma-separated columns (default '*')
 * @param {object}   [options.match]    Equality filters, e.g. { user_id: 1 }
 * @param {string}   [options.order]    Column to order by
 * @param {boolean}  [options.ascending] Order direction (default true)
 * @param {number}   [options.limit]    Max rows
 * @param {boolean}  [options.single]   Return one row instead of array
 * @returns {Promise<object|object[]|null>}
 */
async function supabaseQuery(table, options = {}) {
  const {
    columns = '*',
    match = {},
    order,
    ascending = true,
    limit,
    single = false,
  } = options;

  let query = supabase.from(table).select(columns);

  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }

  if (order) query = query.order(order, { ascending });
  if (limit) query = query.limit(limit);
  if (single) query = query.single();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * INSERT helper — returns the inserted row(s).
 *
 * @param {string}       table
 * @param {object|object[]} rows   Single row object or array of rows
 * @returns {Promise<object|object[]>}
 */
async function supabaseInsert(table, rows) {
  const { data, error } = await supabase
    .from(table)
    .insert(rows)
    .select();

  if (error) throw error;
  return Array.isArray(rows) ? data : data[0];
}

/**
 * UPDATE helper — returns updated row(s).
 *
 * @param {string} table
 * @param {object} values   Columns to set
 * @param {object} match    Equality filters to identify the row(s)
 * @returns {Promise<object[]>}
 */
async function supabaseUpdate(table, values, match) {
  let query = supabase.from(table).update(values);

  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query.select();
  if (error) throw error;
  return data;
}

/**
 * DELETE helper — returns deleted row(s).
 *
 * @param {string} table
 * @param {object} match  Equality filters
 * @returns {Promise<object[]>}
 */
async function supabaseDelete(table, match) {
  let query = supabase.from(table).delete();

  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query.select();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  supabase,
  isConfigured,
  supabaseQuery,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete,
};
