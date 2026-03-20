#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const HOME = os.homedir();
const CACHE_DIR = path.join(HOME, '.claude', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'gsr-update-check.json');
const VERSION_FILE = path.join(HOME, '.claude', 'plugins', 'marketplaces', 'get-shit-right', 'VERSION');
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check cooldown — skip if checked recently
try {
  if (fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const elapsed = Date.now() - new Date(cache.checkedAt).getTime();
    if (elapsed < COOLDOWN_MS) {
      process.exit(0); // Already checked recently
    }
  }
} catch {
  // Cache unreadable — proceed with check
}

// Spawn detached background process to do the actual check
const child = spawn(process.execPath, ['-e', `
  const fs = require('fs');
  const { execSync } = require('child_process');
  const CACHE_DIR = ${JSON.stringify(CACHE_DIR)};
  const CACHE_FILE = ${JSON.stringify(CACHE_FILE)};
  const VERSION_FILE = ${JSON.stringify(VERSION_FILE)};

  try {
    // Get latest version from npm
    const latest = execSync('npm view get-shit-right-cc version', {
      timeout: 10000,
      encoding: 'utf8',
    }).trim();

    // Get installed version
    const installed = fs.readFileSync(VERSION_FILE, 'utf8').trim();

    // Compare versions (simple string comparison works for semver)
    const updateAvailable = latest !== installed &&
      latest.localeCompare(installed, undefined, { numeric: true }) > 0;

    // Write cache
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      installed,
      latest,
      updateAvailable,
      checkedAt: new Date().toISOString(),
    }, null, 2));
  } catch {
    // Silent fail — don't block user session
  }
`], {
  detached: true,
  stdio: 'ignore',
});

child.unref();
