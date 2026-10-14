/**
 * Formats byte size into human readable string (KB, MB, GB).
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formats ISO date string to a friendly format.
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats latency in milliseconds.
 */
export function formatLatency(ms) {
  if (ms == null) return '-';
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
}

/**
 * Formats 0-1 float to percentage string.
 */
export function formatPercent(value, decimals = 1) {
  if (value == null) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats confidence or relevance score (e.g. 0.942 -> 0.94).
 */
export function formatScore(score) {
  if (score == null) return '-';
  return Number(score).toFixed(2);
}
