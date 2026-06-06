import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import type {
  DailySolvePoint,
  DifficultyBreakdownPoint,
  TopicDistributionPoint,
} from '../types'

const DIFFICULTY_COLORS = {
  Easy: 'var(--success)',
  Medium: 'var(--warning)',
  Hard: 'var(--destructive)',
}

const PIE_COLORS = [
  'var(--primary)',
  'var(--success)',
  'var(--warning)',
  'var(--destructive)',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#f97316',
]

interface DsaChartsProps {
  dailySolves: DailySolvePoint[]
  topicDistribution: TopicDistributionPoint[]
  difficultyBreakdown: DifficultyBreakdownPoint[]
}

export function DsaCharts({
  dailySolves,
  topicDistribution,
  difficultyBreakdown,
}: DsaChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>Daily Solves</CardTitle>
          <CardDescription>Problems marked solved over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySolves}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Solved"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topic Distribution</CardTitle>
          <CardDescription>Problems by topic area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            {topicDistribution.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicDistribution}
                    dataKey="count"
                    nameKey="topic"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props) => {
                      const payload = props.payload as TopicDistributionPoint | undefined
                      if (!payload) return ''
                      return `${payload.topic} (${payload.count})`
                    }}
                    labelLine={false}
                  >
                    {topicDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Difficulty Breakdown</CardTitle>
          <CardDescription>Total vs solved by difficulty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="difficulty" tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Total" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="solved" name="Solved" radius={[4, 4, 0, 0]}>
                  {difficultyBreakdown.map((entry) => (
                    <Cell key={entry.difficulty} fill={DIFFICULTY_COLORS[entry.difficulty]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
