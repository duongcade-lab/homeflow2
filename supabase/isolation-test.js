#!/usr/bin/env node
/**
 * HomeFlow — RLS Household Isolation Test (Login MVP STEP 2A)
 *
 * Prerequisites:
 *   1. Run supabase/migrations/20261017_household_foundation.sql in the SQL Editor.
 *   2. Email/password signups enabled in Supabase (Auth -> Providers -> Email).
 *      If disabled, the script reports it and you can instead test with two
 *      real Google accounts (see instructions at the end of the output).
 *
 * Usage:
 *   node supabase/isolation-test.js
 *
 * Reads SUPABASE_URL + SUPABASE_ANON_KEY from the environment, or falls back to
 * the deployed app's /api/config. Never prints secret values.
 */
const fs = require('fs');

async function main() {
  let url, anon;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    url = process.env.SUPABASE_URL;
    anon = process.env.SUPABASE_ANON_KEY;
  } else {
    const r = await fetch('https://homeflow2.vercel.app/api/config', { cache: 'no-store' });
    const cfg = await r.json();
    url = cfg.supabaseUrl;
    anon = cfg.supabaseAnonKey;
  }
  if (!url || !anon) throw new Error('Supabase config not found');

  const api = (path, opts = {}) => fetch(url + path, {
    ...opts,
    headers: { 'apikey': anon, 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });

  const ts = Date.now();
  const emailA = `hftest-a-${ts}@example.com`;
  const emailB = `hftest-b-${ts}@example.com`;
  const pass = 'HomeFlowTest!123';

  const results = [];
  const check = (id, name, cond, detail) => {
    results.push({ id, name, pass: !!cond });
    console.log((cond ? 'PASS' : 'FAIL'), id, '-', name, cond ? '' : '| ' + detail);
  };

  // ---- 1. Sign up two test users ----
  const signup = async (email) => {
    const r = await api('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    return r.json();
  };
  const ua = await signup(emailA);
  const ub = await signup(emailB);
  const aOk = ua.id || (ua.access_token);
  const bOk = ub.id || (ub.access_token);
  check('T1', 'Test user A signed up', !!aOk, JSON.stringify(ua).slice(0, 120));
  check('T1', 'Test user B signed up', !!bOk, JSON.stringify(ub).slice(0, 120));
  if (!aOk || !bOk) {
    console.log('\nEmail signup unavailable (provider disabled or confirmation required).');
    console.log('Alternative: enable Email provider, or test manually with two Google accounts.');
    process.exit(2);
  }

  const token = async (email) => {
    const r = await api('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    return r.json();
  };
  const ta = await token(emailA);
  const tb = await token(emailB);
  const tokA = ta.access_token;
  const tokB = tb.access_token;
  check('T2', 'User A session obtained', !!tokA, JSON.stringify(ta).slice(0, 120));
  check('T2', 'User B session obtained', !!tokB, JSON.stringify(tb).slice(0, 120));
  if (!tokA || !tokB) process.exit(2);

  const authHeaders = (tok) => ({ 'apikey': anon, 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' });
  const rpc = async (tok, fn, body) => {
    const r = await api('/rest/v1/rpc/' + fn, { method: 'POST', headers: authHeaders(tok), body: JSON.stringify(body || {}) });
    return { status: r.status, data: await r.json() };
  };
  const insert = async (tok, table, row) => {
    const r = await api('/rest/v1/' + table, { method: 'POST', headers: authHeaders(tok), body: JSON.stringify(row) });
    return { status: r.status, data: await r.json() };
  };
  const select = async (tok, table) => {
    const r = await api('/rest/v1/' + table + '?select=id,title,household_id', { headers: authHeaders(tok) });
    return { status: r.status, data: await r.json() };
  };

  // ---- 2. A creates Household A; B creates Household B ----
  const ha = await rpc(tokA, 'create_household', { h_name: 'Gia dinh A ' + ts });
  const hb = await rpc(tokB, 'create_household', { h_name: 'Gia dinh B ' + ts });
  check('T3', 'User A created Household A (owner)', ha.status === 200 && typeof ha.data === 'string', JSON.stringify(ha));
  check('T3', 'User B created Household B (owner)', hb.status === 200 && typeof hb.data === 'string', JSON.stringify(hb));
  if (ha.status !== 200 || hb.status !== 200) process.exit(2);

  // ---- 3. Distinguishable records in each household ----
  const famA = await insert(tokA, 'family_members', { household_id: ha.data, kind: 'kid', name: 'Con A', short: 'A', emoji: '\u{1F476}', color: '#F9C74F' });
  const famB = await insert(tokB, 'family_members', { household_id: hb.data, kind: 'kid', name: 'Con B', short: 'B', emoji: '\u{1F476}', color: '#90BE6D' });
  const taskA = await insert(tokA, 'tasks', { household_id: ha.data, title: 'VIEC-CHA-A-' + ts, cat: 'home', status: 'open', owner_id: famA.data[0].id, planner_id: famA.data[0].id });
  const taskB = await insert(tokB, 'tasks', { household_id: hb.data, title: 'VIEC-CHA-B-' + ts, cat: 'home', status: 'open', owner_id: famB.data[0].id, planner_id: famB.data[0].id });
  const expA = await insert(tokA, 'expenses', { household_id: ha.data, title: 'CHIPHI-CHA-A-' + ts, amount: 100, date: '2026-10-17', category: 'home' });
  const expB = await insert(tokB, 'expenses', { household_id: hb.data, title: 'CHIPHI-CHA-B-' + ts, amount: 200, date: '2026-10-17', category: 'home' });
  check('T4', 'Household A records inserted', taskA.status === 201 && expA.status === 201, JSON.stringify([taskA.status, expA.status]));
  check('T4', 'Household B records inserted', taskB.status === 201 && expB.status === 201, JSON.stringify([taskB.status, expB.status]));

  // ---- 4. RLS isolation: cross-household reads MUST return 0 rows ----
  const aTasks = await select(tokA, 'tasks');
  const bTasks = await select(tokB, 'tasks');
  const aExps = await select(tokA, 'expenses');
  const bExps = await select(tokB, 'expenses');

  const aSeesB = (aTasks.data || []).some(t => t.title.includes('-CHA-B-'));
  const bSeesA = (bTasks.data || []).some(t => t.title.includes('-CHA-A-'));
  const aExpSeesB = (aExps.data || []).some(e => e.title.includes('-CHA-B-'));
  const bExpSeesA = (bExps.data || []).some(e => e.title.includes('-CHA-A-'));

  check('T5', 'Household A CANNOT read Household B tasks (RLS)', !aSeesB, JSON.stringify(aTasks.data || []));
  check('T5', 'Household B CANNOT read Household A tasks (RLS)', !bSeesA, JSON.stringify(bTasks.data || []));
  check('T5', 'Household A CANNOT read Household B expenses (RLS)', !aExpSeesB);
  check('T5', 'Household B CANNOT read Household A expenses (RLS)', !bExpSeesA);

  // ---- 5. Each household CAN read its own records ----
  const aSeesOwn = (aTasks.data || []).some(t => t.title.includes('-CHA-A-'));
  const bSeesOwn = (bTasks.data || []).some(t => t.title.includes('-CHA-B-'));
  check('T6', 'Household A reads its own tasks', aSeesOwn, JSON.stringify(aTasks.data || []));
  check('T6', 'Household B reads its own tasks', bSeesOwn, JSON.stringify(bTasks.data || []));

  // ---- 6. One-household-per-user enforced ----
  const second = await rpc(tokA, 'create_household', { h_name: 'Second household' });
  check('T7', 'User cannot create a second household', second.status === 400 || second.status === 401, JSON.stringify(second));

  const passCount = results.filter(r => r.pass).length;
  console.log('===== SUMMARY =====');
  console.log('PASS:', passCount, 'FAIL:', results.length - passCount, 'TOTAL:', results.length);
  console.log(results.every(r => r.pass) ? 'ISOLATION: OK' : 'ISOLATION: FAILED');
  console.log('\nTest users (delete manually in Supabase Dashboard -> Authentication -> Users):');
  console.log(' ', emailA);
  console.log(' ', emailB);
  process.exit(results.every(r => r.pass) ? 0 : 1);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });