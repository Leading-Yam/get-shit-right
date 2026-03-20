#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// --- Version gate ---
const major = parseInt(process.version.slice(1).split('.')[0], 10);
if (major < 16) {
  console.error(`Error: GetShitRight requires Node.js >= 16. You have ${process.version}.`);
  process.exit(1);
}

// --- Constants ---
const HOME = os.homedir();
const INSTALL_DIR = path.join(HOME, '.claude', 'get-shit-right');
const SETTINGS_PATH = path.join(HOME, '.claude', 'settings.json');
const MANIFEST_NAME = 'gsr-file-manifest.json';
const PATCHES_DIR = path.join(INSTALL_DIR, 'gsr-local-patches');

// Files/dirs to copy from the npm package into INSTALL_DIR
const COPY_ITEMS = [
  'commands',
  'agents',
  'workflows',
  'templates',
  'hooks',
  'CLAUDE.md',
  'VERSION',
  'CHANGELOG.md',
  'LICENSE',
];

// --- Helpers ---

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function collectFiles(dir, base) {
  base = base || dir;
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(collectFiles(full, base));
    } else {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

// --- Main ---

function main() {
  const packageRoot = path.resolve(__dirname, '..');
  console.log('GetShitRight installer');
  console.log('');

  // 1. Read current version
  const version = fs.readFileSync(path.join(packageRoot, 'VERSION'), 'utf8').trim();
  console.log(`Installing version ${version}...`);

  // 2. Load existing manifest (if any)
  const manifestPath = path.join(INSTALL_DIR, MANIFEST_NAME);
  let oldManifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      oldManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      // Corrupted manifest — treat as fresh install
    }
  }

  // 3. Detect user modifications & backup
  const backedUp = [];
  if (Object.keys(oldManifest).length > 0) {
    for (const [relPath, expectedHash] of Object.entries(oldManifest)) {
      const installedPath = path.join(INSTALL_DIR, relPath);
      if (fs.existsSync(installedPath)) {
        const currentHash = sha256(installedPath);
        if (currentHash !== expectedHash) {
          // User modified this file — back it up
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const patchPath = path.join(PATCHES_DIR, `${timestamp}_${relPath.replace(/\//g, '_')}`);
          fs.mkdirSync(path.dirname(patchPath), { recursive: true });
          fs.copyFileSync(installedPath, patchPath);
          backedUp.push(relPath);
        }
      }
    }
  }

  // 4. Copy plugin files
  fs.mkdirSync(INSTALL_DIR, { recursive: true });
  for (const item of COPY_ITEMS) {
    const src = path.join(packageRoot, item);
    const dest = path.join(INSTALL_DIR, item);
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    }
  }

  // 5. Generate new manifest
  const newManifest = {};
  for (const item of COPY_ITEMS) {
    const itemPath = path.join(INSTALL_DIR, item);
    if (!fs.existsSync(itemPath)) continue;
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      for (const relFile of collectFiles(itemPath, INSTALL_DIR)) {
        newManifest[relFile] = sha256(path.join(INSTALL_DIR, relFile));
      }
    } else {
      newManifest[item] = sha256(itemPath);
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));

  // 6. Register hooks in settings.json
  registerHooks();

  // 7. Print summary
  console.log('');
  console.log(`GetShitRight v${version} installed to ${INSTALL_DIR}`);
  if (backedUp.length > 0) {
    console.log('');
    console.log(`Backed up ${backedUp.length} modified file(s) to ${PATCHES_DIR}:`);
    for (const f of backedUp) {
      console.log(`  - ${f}`);
    }
    console.log('Run /val:reapply-patches in Claude Code to restore your changes.');
  }
  console.log('');
  console.log('Restart Claude Code to apply changes.');
}

function registerHooks() {
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
      // Corrupted settings — start with empty object but warn
      console.warn('Warning: Could not parse ~/.claude/settings.json. Creating hooks section.');
    }
  }

  if (!settings.hooks) settings.hooks = {};

  // --- Hook entries (inside hooks object) ---
  const hookEntries = [
    {
      event: 'SessionStart',
      command: `node ${path.join(INSTALL_DIR, 'hooks', 'gsr-check-update.js')}`,
      match: 'gsr-check-update.js',
    },
  ];

  for (const hook of hookEntries) {
    if (!Array.isArray(settings.hooks[hook.event])) {
      settings.hooks[hook.event] = [];
    }
    // Deduplicate: check inside the hooks array of each entry
    const exists = settings.hooks[hook.event].some((entry) =>
      Array.isArray(entry.hooks) &&
      entry.hooks.some((h) => h.command && h.command.includes(hook.match))
    );
    if (!exists) {
      settings.hooks[hook.event].push({
        matcher: '',
        hooks: [{ type: 'command', command: hook.command }],
      });
    }
  }

  // --- Remove invalid Statusline key from hooks (if present from prior installs) ---
  delete settings.hooks.Statusline;

  // --- Statusline config (top-level, not inside hooks) ---
  const statuslineCommand = `node ${path.join(INSTALL_DIR, 'hooks', 'gsr-statusline.js')}`;
  if (!settings.statusLine || !String(settings.statusLine.command || '').includes('gsr-statusline.js')) {
    settings.statusLine = { type: 'command', command: statuslineCommand };
  }

  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

main();
