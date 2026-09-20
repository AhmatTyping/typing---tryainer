/* Bayanlingo backend Worker: auth (signup/login/sessions) + progress sync + static assets fallback */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await handleApi(request, env, url); }
      catch (e) { return json({ error: 'Server error: ' + e.message }, 500); }
    }
    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
function bytesToHex(bytes) { return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''); }
function hexToBytes(hex) { const arr = new Uint8Array(hex.length / 2); for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16); return arr; }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function genToken() { return bytesToHex(crypto.getRandomValues(new Uint8Array(32))); }

async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}
async function verifyPassword(password, saltHex, hashHex) {
  const { hash } = await hashPassword(password, saltHex);
  return hash === hashHex;
}

async function handleApi(request, env, url) {
  const path = url.pathname;
  if (path === '/api/signup' && request.method === 'POST') return signup(request, env);
  if (path === '/api/login' && request.method === 'POST') return login(request, env);
  if (path === '/api/logout' && request.method === 'POST') return logout(request, env);
  if (path === '/api/me' && request.method === 'GET') return me(request, env);
  if (path === '/api/progress' && request.method === 'GET') return getProgress(request, env);
  if (path === '/api/progress' && request.method === 'POST') return saveProgress(request, env);
  return json({ error: 'Not found' }, 404);
}

async function signup(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400); }
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!isValidEmail(email)) return json({ error: 'Invalid email' }, 400);
  if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
  if (existing) return json({ error: 'Email already registered' }, 409);

  const { hash, salt } = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.prepare('INSERT INTO users (id,email,password_hash,password_salt,created_at) VALUES (?,?,?,?,?)').bind(id, email, hash, salt, now).run();

  const token = genToken();
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').bind(token, id, expires).run();

  return json({ ok: true, token, email });
}

async function login(request, env) {
  let body; try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400); }
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  const user = await env.DB.prepare('SELECT id,password_hash,password_salt FROM users WHERE email=?').bind(email).first();
  if (!user) return json({ error: 'Invalid email or password' }, 401);

  const ok = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!ok) return json({ error: 'Invalid email or password' }, 401);

  const token = genToken();
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').bind(token, user.id, expires).run();

  return json({ ok: true, token, email });
}

async function getUserFromToken(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const row = await env.DB.prepare('SELECT s.user_id, s.expires_at, u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?').bind(token).first();
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) return null;
  return { id: row.user_id, email: row.email, token };
}

async function me(request, env) {
  const user = await getUserFromToken(request, env);
  if (!user) return json({ error: 'Not authenticated' }, 401);
  return json({ email: user.email });
}

async function logout(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(token).run();
  return json({ ok: true });
}

async function getProgress(request, env) {
  const user = await getUserFromToken(request, env);
  if (!user) return json({ error: 'Not authenticated' }, 401);
  const row = await env.DB.prepare('SELECT data FROM progress WHERE user_id=?').bind(user.id).first();
  return json({ data: row ? JSON.parse(row.data) : null });
}

async function saveProgress(request, env) {
  const user = await getUserFromToken(request, env);
  if (!user) return json({ error: 'Not authenticated' }, 401);
  let body; try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400); }
  const dataStr = JSON.stringify(body.data || {});
  const now = new Date().toISOString();
  await env.DB.prepare('INSERT INTO progress (user_id,data,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at').bind(user.id, dataStr, now).run();
  return json({ ok: true });
}
