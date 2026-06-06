import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { tierColorClass, tierLabel } from '../lib/computeReadiness'
import type { CompanyReadiness } from '../types'

interface CompanyScoreGridProps {
  companies: CompanyReadiness[]
}

const BAR_COLORS = [
  'var(--primary)',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#6366f1',
]

export function CompanyScoreGrid({ companies }: CompanyScoreGridProps) {
  const chartData = companies.map((c) => ({
    name: c.name.split(' ')[0],
    fullName: c.name,
    score: c.score,
    alignment: c.topicAlignment,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company-wise Readiness</CardTitle>
          <CardDescription>Scores tuned to each company&apos;s interview bar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{company.name}</CardTitle>
                <Badge variant="outline" className={tierColorClass(company.tier)}>
                  {company.score}%
                </Badge>
              </div>
              <CardDescription>{tierLabel(company.tier)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Topic alignment</span>
                <span className="font-mono tabular-nums">{company.topicAlignment}%</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{company.gapAnalysis}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
