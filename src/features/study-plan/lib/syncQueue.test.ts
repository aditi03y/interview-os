import { describe, expect, it } from 'vitest'
import { DaySyncQueue } from '@/features/study-plan/lib/syncQueue'

describe('DaySyncQueue', () => {
  it('serializes concurrent writes for the same day', async () => {
    const queue = new DaySyncQueue()
    const order: number[] = []

    const first = queue.enqueue(1, async () => {
      await new Promise((r) => setTimeout(r, 30))
      order.push(1)
    })

    const second = queue.enqueue(1, async () => {
      order.push(2)
    })

    await Promise.all([first, second])
    expect(order).toEqual([1, 2])
  })

  it('allows parallel writes for different days', async () => {
    const queue = new DaySyncQueue()
    const start = Date.now()

    await Promise.all([
      queue.enqueue(1, async () => {
        await new Promise((r) => setTimeout(r, 20))
      }),
      queue.enqueue(2, async () => {
        await new Promise((r) => setTimeout(r, 20))
      }),
    ])

    expect(Date.now() - start).toBeLessThan(40)
  })
})
