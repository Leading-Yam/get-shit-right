#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE_FILE = path.join(os.homedir(), '.claude', 'cache', 'gsr-update-check.json');

try {
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  if (cache.updateAvailable) {
    process.stdout.write('\x1b[33m⬆ /val:update\x1b[0m │ ');
  }
} catch {
  // Silent fail — no output
}
