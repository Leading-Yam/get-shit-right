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
const CLAUDE_DIR = path.join(HOME, '.claude');
const SUPPORT_DIR = path.join(CLAUDE_DIR, 'get-shit-right');
const COMMANDS_DIR = path.join(CLAUDE_DIR, 'commands', 'val');
const AGENTS_DIR = path.join(CLAUDE_DIR, 'agents');
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');
const MANIFEST_NAME = 'gsr-file-manifest.json';
const PATCHES_DIR = path.join(SUPPORT_DIR, 'gsr-local-patches');

// Legacy paths to clean up
const LEGACY_PATHS = [
  path.join(CLAUDE_DIR, 'plugins', 'marketplaces', 'get-shit-right'),
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

function removePath(p) {
  try {
    const stat = fs.lstatSync(p);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(p);
    } else if (stat.isDirectory()) {
      fs.rmSync(p, { recursive: true, force: true });
    } else {
      fs.unlinkSync(p);
    }
    return true;
  } catch {
    return false;
  }
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
  const manifestPath = path.join(SUPPORT_DIR, MANIFEST_NAME);
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
      // Resolve manifest paths to their actual install locations
      let installedPath;
      if (relPath.startsWith('commands/val/')) {
        installedPath = path.join(COMMANDS_DIR, path.basename(relPath));
      } else if (relPath.startsWith('agents/')) {
        installedPath = path.join(AGENTS_DIR, path.basename(relPath));
      } else {
        installedPath = path.join(SUPPORT_DIR, relPath);
      }
      if (fs.existsSync(installedPath)) {
        const currentHash = sha256(installedPath);
        if (currentHash !== expectedHash) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const patchPath = path.join(PATCHES_DIR, `${timestamp}_${relPath.replace(/\//g, '_')}`);
          fs.mkdirSync(path.dirname(patchPath), { recursive: true });
          fs.copyFileSync(installedPath, patchPath);
          backedUp.push(relPath);
        }
      }
    }
  }

  // 4. Clean up legacy install paths
  for (const legacyPath of LEGACY_PATHS) {
    if (removePath(legacyPath)) {
      console.log(`Removed legacy install at ${legacyPath}`);
    }
  }
  // Remove broken symlink at ~/.claude/commands/val if present
  const valSymlink = path.join(CLAUDE_DIR, 'commands', 'val');
  try {
    const stat = fs.lstatSync(valSymlink);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(valSymlink);
      console.log('Removed legacy symlink at ~/.claude/commands/val');
    }
  } catch {
    // Doesn't exist or not a symlink — fine
  }

  // 5. Copy files to their destinations
  //    - commands/val/*.md  → ~/.claude/commands/val/
  //    - agents/*.md        → ~/.claude/agents/ (prefixed with gsr-)
  //    - everything else    → ~/.claude/get-shit-right/
  fs.mkdirSync(SUPPORT_DIR, { recursive: true });
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });
  fs.mkdirSync(AGENTS_DIR, { recursive: true });

  // Commands
  const commandsSrc = path.join(packageRoot, 'commands', 'val');
  if (fs.existsSync(commandsSrc)) {
    for (const file of fs.readdirSync(commandsSrc)) {
      fs.copyFileSync(path.join(commandsSrc, file), path.join(COMMANDS_DIR, file));
    }
  }

  // Agents (only copy gsr-* agents to avoid conflicts with other tools)
  const agentsSrc = path.join(packageRoot, 'agents');
  if (fs.existsSync(agentsSrc)) {
    for (const file of fs.readdirSync(agentsSrc)) {
      if (file.startsWith('gsr-')) {
        fs.copyFileSync(path.join(agentsSrc, file), path.join(AGENTS_DIR, file));
      }
    }
  }

  // Support files (workflows, templates, hooks, docs)
  const supportItems = ['workflows', 'templates', 'hooks', 'CLAUDE.md', 'VERSION', 'CHANGELOG.md', 'LICENSE'];
  for (const item of supportItems) {
    const src = path.join(packageRoot, item);
    const dest = path.join(SUPPORT_DIR, item);
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    }
  }

  // 6. Generate new manifest (tracks all installed files for modification detection)
  const newManifest = {};
  // Track commands
  for (const file of fs.readdirSync(COMMANDS_DIR)) {
    const relPath = `commands/val/${file}`;
    newManifest[relPath] = sha256(path.join(COMMANDS_DIR, file));
  }
  // Track agents
  for (const file of fs.readdirSync(AGENTS_DIR)) {
    if (file.startsWith('gsr-')) {
      const relPath = `agents/${file}`;
      newManifest[relPath] = sha256(path.join(AGENTS_DIR, file));
    }
  }
  // Track support files
  for (const item of supportItems) {
    const itemPath = path.join(SUPPORT_DIR, item);
    if (!fs.existsSync(itemPath)) continue;
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      for (const relFile of collectFiles(itemPath, SUPPORT_DIR)) {
        newManifest[relFile] = sha256(path.join(SUPPORT_DIR, relFile));
      }
    } else {
      newManifest[item] = sha256(itemPath);
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(newManifest, null, 2));

  // 7. Register hooks in settings.json
  registerHooks();

  // 8. Print summary
  console.log('');
  console.log(`GetShitRight v${version} installed successfully`);
  console.log(`  Commands: ${COMMANDS_DIR}`);
  console.log(`  Agents:   ${AGENTS_DIR}`);
  console.log(`  Support:  ${SUPPORT_DIR}`);
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
      console.warn('Warning: Could not parse ~/.claude/settings.json. Creating hooks section.');
    }
  }

  if (!settings.hooks) settings.hooks = {};

  // --- Hook entries ---
  const hookEntries = [
    {
      event: 'SessionStart',
      command: `node ${path.join(SUPPORT_DIR, 'hooks', 'gsr-check-update.js')}`,
      match: 'gsr-check-update.js',
    },
  ];

  for (const hook of hookEntries) {
    if (!Array.isArray(settings.hooks[hook.event])) {
      settings.hooks[hook.event] = [];
    }
    // Purge ALL GSR entries (legacy paths, malformed, bare command) — we re-add the correct one below
    settings.hooks[hook.event] = settings.hooks[hook.event].filter((entry) => {
      if (!Array.isArray(entry.hooks) && entry.command && entry.command.includes(hook.match)) return false;
      if (Array.isArray(entry.hooks) && !('matcher' in entry) &&
        entry.hooks.some((h) => h.command && h.command.includes(hook.match))) return false;
      if (Array.isArray(entry.hooks) &&
        entry.hooks.some((h) => h.command && h.command.includes(hook.match))) return false;
      return true;
    });
    settings.hooks[hook.event].push({
      matcher: '',
      hooks: [{ type: 'command', command: hook.command }],
    });
  }

  // --- Remove invalid keys from hooks (if present from prior installs) ---
  delete settings.hooks.Statusline;
  delete settings.hooks.Notification;

  // --- Statusline config (top-level) ---
  const statuslineCommand = `node ${path.join(SUPPORT_DIR, 'hooks', 'gsr-statusline.js')}`;
  settings.statusLine = { type: 'command', command: statuslineCommand };

  // --- Remove stale marketplace registration (npm handles distribution, not git clone) ---
  if (settings.enabledPlugins) {
    delete settings.enabledPlugins['get-shit-right@get-shit-right'];
  }
  if (settings.extraKnownMarketplaces) {
    delete settings.extraKnownMarketplaces['get-shit-right'];
  }

  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

main();
