// Instance-local, bounded protection against high-volume authentication attempts.
// For multi-instance production deployments, replace with a shared trusted store.
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10, maxKeys = 10000, now = Date.now } = {}) {
  if (!Number.isInteger(windowMs) || windowMs < 1 ||
      !Number.isInteger(max) || max < 1 ||
      !Number.isInteger(maxKeys) || maxKeys < 1) throw new Error('Invalid rate-limit settings');

  const counters = new Map();

  return (req, res, next) => {
    const time = now();
    const key = String(req.ip || req.socket?.remoteAddress || 'unknown');
    let record = counters.get(key);

    if (record && time >= record.resetAt) {
      counters.delete(key);
      record = null;
    }

    if (!record) {
      if (counters.size >= maxKeys) {
        for (const [entryKey, entry] of counters) {
          if (time >= entry.resetAt) counters.delete(entryKey);
        }
      }
      if (counters.size >= maxKeys) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
      }
      record = { count: 0, resetAt: time + windowMs };
      counters.set(key, record);
    }

    if (record.count >= max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((record.resetAt - time) / 1000))));
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    record.count += 1;
    return next();
  };
}

module.exports = { createRateLimiter };
