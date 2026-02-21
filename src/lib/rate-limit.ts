import { RateLimiterMemory } from "rate-limiter-flexible";

// Login rate limiter: 5 attempts per 15 minutes per IP
export const loginRateLimiter = new RateLimiterMemory({
    points: 5,
    duration: 15 * 60, // 15 minutes
    blockDuration: 15 * 60, // Block for 15 minutes after limit reached
});

// General API rate limiter: 100 requests per minute per IP
export const apiRateLimiter = new RateLimiterMemory({
    points: 100,
    duration: 60,
});

// QR token generation limiter: 10 per minute per IP
export const qrRateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

export async function checkRateLimit(
    limiter: RateLimiterMemory,
    key: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
    try {
        await limiter.consume(key);
        return { allowed: true };
    } catch (rejRes) {
        const res = rejRes as { msBeforeNext?: number };
        return {
            allowed: false,
            retryAfter: Math.ceil((res.msBeforeNext || 0) / 1000),
        };
    }
}
