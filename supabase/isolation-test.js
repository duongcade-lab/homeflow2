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
 * Uses curl for HTTP (works through corporate egress proxies).
 */
import { execFileSync } from 'child_process';

function curl(args, headers = {}, data) {
  const full = ['-sS', '-L'];
  for (const [k, v] of Object.entries(headers)) full.push('-H', `${k}: ${v}`);
  if (data) full.push('--data-raw', data);
  full.push(...String(args).split(/\s+/).filter(Boolean).map(t => t.replace(/^"|"$/g, '')));
  return execFileSync('curl', full, { maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' });
}

async function main() {
  let url, anon;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    url = process.env.SUPABASE_URL;
    anon = process.env.SUPABASE_ANON_KEY;
  } else {
    const cfg = JSON.parse(curl('https://homeflow2.vercel.app/api/config'));
    url = cfg.supabaseUrl;
    anon = cfg.supabaseAnonKey;
  }
  if (!url || !anon) throw new Error('Supabase config not found');

const ts = Date.now();
  const manualA = process.env.TEST_USER_A_EMAIL && process.env.TEST_USER_A_PASSWORD;
  const manualB = process.env.TEST_USER_B_EMAIL && process.env.TEST_USER_B_PASSWORD;
  const emailA = manualA ? process.env.TEST_USER_A_EMAIL : `hftest-a-${ts}@gmail.com`;
  const emailB = manualB ? process.env.TEST_USER_B_EMAIL : `hftest-b-${ts}@gmail.com`;
  const passA = manualA ? process.env.TEST_USER_A_PASSWORD : 'HomeFlowTest!123';
  const passB = manualB ? process.env.TEST_USER_B_PASSWORD : 'HomeFlowTest!123';

  const results = [];
  const check = (id, name, cond, detail) => {
    results.push({ id, name, pass: !!cond });
    console.log((cond ? 'PASS' : 'FAIL'), id, '-', name, cond ? '' : '| ' + detail);
  };

  const jsonReq = (method, path, body, headers = {}) => {
    const out = curl(`-X ${method} "${url}${path}"`, { 'apikey': anon, 'Content-Type': 'application/json', ...headers }, body ? JSON.stringify(body) : null);
    return out ? JSON.parse(out) : null;
  };

  // ---- 1. Obtain sessions for two test users (manual users or email signup) ----
  if (!manualA || !manualB) {
    const ua = jsonReq('POST', '/auth/v1/signup', { email: emailA, password: passA });
    const ub = jsonReq('POST', '/auth/v1/signup', { email: emailB, password: passB });
    check('T1', 'Test user A signed up', !!ua.id || !!ua.access_token, JSON.stringify(ua).slice(0, 120));
    check('T1', 'Test user B signed up', !!ub.id || !!ub.access_token, JSON.stringify(ub).slice(0, 120));
    if (!(ua.id || ua.access_token) || !(ub.id || ub.access_token)) {
      console.log('\nEmail signup unavailable (provider disabled, confirmation required, or rate-limited).');
      console.log('Alternative: create two test users in Supabase Dashboard -> Authentication -> Users,');
      console.log('then run with: TEST_USER_A_EMAIL=... TEST_USER_A_PASSWORD=... TEST_USER_B_EMAIL=... TEST_USER_B_PASSWORD=... node supabase/isolation-test.js');
      process.exit(2);
    }
  } else {
    console.log('Using manual test users:', emailA, '/', emailB);
  }

  const ta = jsonReq('POST', '/auth/v1/token?grant_type=password', { email: emailA, password: passA });
  const tb = jsonReq('POST', '/auth/v1/token?grant_type=password', { email: emailB, password: passB });
  const tokA = ta.access_token;
  const tokB = tb.access_token;
  check('T2', 'User A session obtained', !!tokA, JSON.stringify(ta).slice(0, 120));
  check('T2', 'User B session obtained', !!tokB, JSON.stringify(tb).slice(0, 120));
  if (!tokA || !tokB) process.exit(2);

  const authH = (tok) => ({ 'apikey': anon, 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' });
  const rpc = (tok, fn, body) => {
    const out = curl(`-X POST "${url}/rest/v1/rpc/${fn}"`, authH(tok), body ? JSON.stringify(body) : null);
    return { status: 200, data: JSON.parse(out) };
  };
  const insert = (tok, table, row) => {
    const out = curl(`-X POST "${url}/rest/v1/${table}"`, authH(tok), JSON.stringify(row));
    return { status: 201, data: JSON.parse(out) };
  };
  const select = (tok, table) => {
    const out = curl(`"${url}/rest/v1/${table}?select=id,title,household_id"`, authH(tok));
    return { status: 200, data: JSON.parse(out) };
  };

  // ---- 2. A creates Household A; B creates Household B ----
  const ha = rpc(tokA, 'create_household', { h_name: 'Gia dinh A ' + ts });
  const hb = rpc(tokB, 'create_household', { h_name: 'Gia dinh B ' + ts });
  check('T3', 'User A created Household A (owner)', typeof ha.data === 'string', JSON.stringify(ha.data));
  check('T3', 'User B created Household B (owner)', typeof hb.data === 'string', JSON.stringify(hb.data));
  if (typeof ha.data !== 'string' || typeof hb.data !== 'string') process.exit(2);

  // ---- 3. Distinguishable records in each household ----
  const famA = insert(tokA, 'family_members', { household_id: ha.data, kind: 'kid', name: 'Con A', short: 'A', emoji: '\u{1F476}', color: '#F9C74F' });
  const famB = insert(tokB, 'family_members', { household_id: hb.data, kind: 'kid', name: 'Con B', short: 'B', emoji: '\u{1F476}', color: '#90BE6D' });
  const taskA = insert(tokA, 'tasks', { household_id: ha.data, title: 'VIEC-CHA-A-' + ts, cat: 'home', status: 'open', owner_id: famA.data[0].id, planner_id: famA.data[0].id });
  const taskB = insert(tokB, 'tasks', { household_id: hb.data, title: 'VIEC-CHA-B-' + ts, cat: 'home', status: 'open', owner_id: famB.data[0].id, planner_id: famB.data[0].id });
  const expA = insert(tokA, 'expenses', { household_id: ha.data, title: 'CHIPHI-CHA-A-' + ts, amount: 100, date: '2026-10-17', category: 'home' });
  const expB = insert(tokB, 'expenses', { household_id: hb.data, title: 'CHIPHI-CHA-B-' + ts, amount: 200, date: '2026-10-17', category: 'home' });
  check('T4', 'Household A records inserted', taskA.data && taskA.data.length > 0 && expA.data && expA.data.length > 0, JSON.stringify([taskA.status, expA.status]));
  check('T4', 'Household B records inserted', taskB.data && taskB.data.length > 0 && expB.data && expB.data.length > 0, JSON.stringify([taskB.status, expB.status]));

  // ---- 4. RLS isolation: cross-household reads MUST return 0 rows ----
  const aTasks = select(tokA, 'tasks');
  const bTasks = select(tokB, 'tasks');
  const aExps = select(tokA, 'expenses');
  const bExps = select(tokB, 'expenses');

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
  const secondRaw = curl(`-X POST "${url}/rest/v1/rpc/create_household"`, authH(tokA), JSON.stringify({ h_name: 'Second household' }));
  let secondErr = false;
  try { const s = JSON.parse(secondRaw); secondErr = !!s.code; } catch (e) { secondErr = false; }
  check('T7', 'User cannot create a second household', secondErr, secondRaw.slice(0, 120));

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