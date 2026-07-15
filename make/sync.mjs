#!/usr/bin/env node
/**
 * Pushes the app source in ./app to Make's Custom Apps API (SDK Apps).
 *
 * Usage:
 *   MAKE_API_TOKEN=xxx MAKE_ZONE=eu1 node make/sync.mjs [--create]
 *
 * Requirements:
 *   - A Make API token with scopes `sdk-apps:read` and `sdk-apps:write`
 *     (Make → Profile → API/MCP access).
 *   - MAKE_ZONE is your account zone: eu1, eu2, us1, us2...
 *   - Pass --create on the first run to create the app itself; afterwards
 *     the script only updates sections.
 *
 * Endpoint shapes follow https://developers.make.com/api-documentation
 * (SDK Apps section). If Make returns 404 on a path, check the docs — the
 * SDK Apps API occasionally changes between versions.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(ROOT, 'app');

const TOKEN = process.env.MAKE_API_TOKEN;
const ZONE = process.env.MAKE_ZONE ?? 'eu1';
const CREATE = process.argv.includes('--create');
if (!TOKEN) {
  console.error('Set MAKE_API_TOKEN (scopes: sdk-apps:read, sdk-apps:write).');
  process.exit(1);
}

const BASE = `https://${ZONE}.make.com/api/v2`;
const APP_VERSION = 1;

const MODULE_TYPE_IDS = {
  trigger: 1,
  action: 4,
  search: 9,
  instant_trigger: 10,
  universal: 12,
};

const manifest = JSON.parse(await readFile(path.join(ROOT, 'manifest.json'), 'utf8'));
const metadata = JSON.parse(await readFile(path.join(APP_DIR, 'metadata.json'), 'utf8'));
// Make appends a random suffix to app names (e.g. bolten-l1u5uk). After the
// first --create run, pass the generated name via MAKE_APP_NAME.
let APP_NAME = process.env.MAKE_APP_NAME ?? metadata.name;

async function call(method, url, body, contentType = 'application/json') {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: {
      authorization: `Token ${TOKEN}`,
      'content-type': contentType,
    },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    // 409/400 "already exists" is fine when re-running create steps
    if (res.status === 400 || res.status === 409) {
      console.warn(`  ~ ${method} ${url} → ${res.status} (probably already exists, continuing)`);
      return null;
    }
    throw new Error(`${method} ${url} → ${res.status}: ${text}`);
  }
  console.log(`  ✓ ${method} ${url}`);
  return text ? JSON.parse(text) : null;
}

// Sections are raw JSONC payloads (the .imljson file contents as-is)
async function putSection(url, filePath) {
  if (!existsSync(filePath)) return;
  const raw = await readFile(filePath, 'utf8');
  await call('PUT', url, raw, 'application/jsonc');
}

// ── 1. App ────────────────────────────────────────────────────────────────────
if (CREATE && !process.env.MAKE_APP_NAME) {
  console.log('Creating app…');
  const created = await call('POST', '/sdk/apps', {
    name: metadata.name,
    label: metadata.label,
    description: metadata.description,
    theme: metadata.theme,
    language: metadata.language ?? 'en',
    countries: metadata.countries ?? [],
    audience: 'countries',
  });
  APP_NAME = created?.app?.name ?? APP_NAME;
  console.log(`  app name: ${APP_NAME}`);
}

console.log('Base…');
await putSection(`/sdk/apps/${APP_NAME}/${APP_VERSION}/base`, path.join(APP_DIR, 'base.imljson'));

// ── 2. Connection ─────────────────────────────────────────────────────────────
const conn = manifest.connection;
const connDir = path.join(APP_DIR, 'connections', conn.name);
let connectionName = process.env.MAKE_CONNECTION_NAME;
if (CREATE) {
  console.log('Connection…');
  const created = await call('POST', `/sdk/apps/${APP_NAME}/connections`, {
    type: conn.type,
    label: conn.label,
  });
  connectionName = created?.appConnection?.name ?? connectionName;
}
if (!connectionName) {
  const list = await call('GET', `/sdk/apps/${APP_NAME}/connections`);
  connectionName = list?.appConnections?.[0]?.name;
}
if (!connectionName) throw new Error('Could not resolve connection name — set MAKE_CONNECTION_NAME.');
await putSection(`/sdk/apps/connections/${connectionName}/api`, path.join(connDir, 'api.imljson'));
await putSection(`/sdk/apps/connections/${connectionName}/parameters`, path.join(connDir, 'parameters.imljson'));

// ── 3. Webhooks ───────────────────────────────────────────────────────────────
const webhookNames = {};
for (const wh of manifest.webhooks) {
  console.log(`Webhook ${wh.name}…`);
  const dir = path.join(APP_DIR, 'webhooks', wh.name);
  let whName = process.env[`MAKE_WEBHOOK_${wh.name.replaceAll('-', '_').toUpperCase()}`];
  if (CREATE) {
    const created = await call('POST', `/sdk/apps/${APP_NAME}/webhooks`, {
      type: wh.type === 'dedicated' ? 'web' : 'web-shared',
      label: wh.label,
      connection: wh.connection ? connectionName : null,
    });
    whName = created?.appWebhook?.name ?? whName;
  }
  if (!whName) {
    const list = await call('GET', `/sdk/apps/${APP_NAME}/webhooks`);
    whName = list?.appWebhooks?.[0]?.name;
  }
  webhookNames[wh.name] = whName;
  await putSection(`/sdk/apps/webhooks/${whName}/api`, path.join(dir, 'api.imljson'));
  await putSection(`/sdk/apps/webhooks/${whName}/parameters`, path.join(dir, 'parameters.imljson'));
}

// ── 4. RPCs ───────────────────────────────────────────────────────────────────
for (const rpc of manifest.rpcs) {
  console.log(`RPC ${rpc.name}…`);
  const dir = path.join(APP_DIR, 'rpcs', rpc.dir);
  if (CREATE) {
    await call('POST', `/sdk/apps/${APP_NAME}/${APP_VERSION}/rpcs`, {
      name: rpc.name,
      label: rpc.label,
      connection: connectionName,
    });
  }
  await putSection(`/sdk/apps/${APP_NAME}/${APP_VERSION}/rpcs/${rpc.name}/api`, path.join(dir, 'api.imljson'));
  await putSection(`/sdk/apps/${APP_NAME}/${APP_VERSION}/rpcs/${rpc.name}/parameters`, path.join(dir, 'parameters.imljson'));
}

// ── 5. Modules ────────────────────────────────────────────────────────────────
for (const mod of manifest.modules) {
  console.log(`Module ${mod.name}…`);
  const dir = path.join(APP_DIR, 'modules', mod.dir);
  if (CREATE) {
    await call('POST', `/sdk/apps/${APP_NAME}/${APP_VERSION}/modules`, {
      name: mod.name,
      label: mod.label,
      description: mod.description,
      typeId: MODULE_TYPE_IDS[mod.type],
      connection: mod.type === 'instant_trigger' ? null : connectionName,
      webhook: mod.webhook ? webhookNames[mod.webhook] : undefined,
      crud: mod.crud,
    });
  }
  const base = `/sdk/apps/${APP_NAME}/${APP_VERSION}/modules/${mod.name}`;
  await putSection(`${base}/api`, path.join(dir, 'api.imljson'));
  await putSection(`${base}/parameters`, path.join(dir, 'parameters.imljson'));
  await putSection(`${base}/expect`, path.join(dir, 'expect.imljson'));
  await putSection(`${base}/interface`, path.join(dir, 'interface.imljson'));
  await putSection(`${base}/samples`, path.join(dir, 'samples.imljson'));
}

console.log('\nDone. Open the app in Make → Custom apps to review and test.');
