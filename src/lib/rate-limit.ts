type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  bucket.count += 1;

  if (bucket.count > max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }

  return { ok: true, remaining: max - bucket.count };
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

if (buckets.size > 10_000) buckets.clear();
