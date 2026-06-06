/**
 * Client-side sliding-window rate limiter to reduce 429s on free-tier accounts.
 * Server-side limits still apply; this is a best-effort guard only.
 */
export class GeminiRateLimiter {
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly timestamps: number[] = []

  constructor(requestsPerMinute: number) {
    this.maxRequests = Math.max(1, requestsPerMinute)
    this.windowMs = 60_000
  }

  async acquire(): Promise<void> {
    this.prune()

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(Date.now())
      return
    }

    const oldest = this.timestamps[0]!
    const waitMs = this.windowMs - (Date.now() - oldest) + 25
    await sleep(waitMs)
    return this.acquire()
  }

  private prune(): void {
    const cutoff = Date.now() - this.windowMs
    while (this.timestamps.length > 0 && this.timestamps[0]! < cutoff) {
      this.timestamps.shift()
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
