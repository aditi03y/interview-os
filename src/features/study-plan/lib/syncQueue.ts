/**
 * Serializes async work per day to prevent concurrent upserts from overwriting each other.
 */
export class DaySyncQueue {
  private readonly chains = new Map<number, Promise<void>>()

  enqueue<T>(dayNumber: number, task: () => Promise<T>): Promise<T> {
    const previous = this.chains.get(dayNumber) ?? Promise.resolve()

    const next = previous
      .catch(() => undefined)
      .then(task)
      .finally(() => {
        if (this.chains.get(dayNumber) === next) {
          this.chains.delete(dayNumber)
        }
      }) as Promise<T>

    this.chains.set(dayNumber, next.then(() => undefined))
    return next
  }

  flush(): Promise<void> {
    return Promise.all([...this.chains.values()]).then(() => undefined)
  }
}

export const studyPlanSyncQueue = new DaySyncQueue()
