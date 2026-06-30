'use strict';

/**
 * Minimal JSON fetch helper with a timeout. Uses Node's global fetch (Node 18+).
 */
async function fetchJson(url, { timeoutMs = 20000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      throw new Error(`GET ${url} failed with status ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchJson };
