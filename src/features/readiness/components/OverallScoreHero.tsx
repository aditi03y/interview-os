import { tierColorClass, tierLabel } from '../lib/computeReadiness'
import type { ReadinessTier } from '../types'

interface OverallScoreHeroProps {
  score: number
  tier: ReadinessTier
}

export function OverallScoreHero({ score, tier }: OverallScoreHeroProps) {
  const color = tierColorClass(tier)

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 px-6 py-10 text-center">
      <p className="text-sm font-medium text-muted-foreground">Overall Interview Readiness</p>
      <div
        className="relative my-4 flex h-36 w-36 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${score * 3.6}deg, var(--muted) 0deg)`,
        }}
      >
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-card">
          <span className={`text-4xl font-bold tabular-nums ${color}`}>{score}%</span>
        </div>
      </div>
      <p className={`text-lg font-semibold ${color}`}>{tierLabel(tier)}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Weighted across Amazon, Google, Microsoft, Uber, Atlassian, Flipkart & Walmart
      </p>
    </div>
  )
}
