import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { CHART_AXIS_TICK, CHART_GRID, CHART_TOOLTIP_STYLE } from '../lib/chartTheme'
import type { AnalyticsSnapshot } from '../types'

interface TrendChartsProps {
  trends: AnalyticsSnapshot['trends']
}

export function TrendCharts({ trends }: TrendChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TrendCard
        title="Study Time"
        description="Hours logged per day (study plan)"
        data={trends.studyTime}
        dataKey="value"
        color="var(--chart-1, var(--primary))"
        unit="h"
      />
      <TrendCard
        title="Test Scores"
        description="Average test score % per day"
        data={trends.testScores}
        dataKey="value"
        color="var(--chart-2, #8b5cf6)"
        unit="%"
        domain={[0, 100]}
      />
      <TrendCard
        title="DSA Progress"
        description="Problems solved per day"
        data={trends.dsaSolves}
        dataKey="value"
        color="var(--chart-3, #06b6d4)"
        unit=""
      />
      <TrendCard
        title="Violations"
        description="Proctoring events per day"
        data={trends.violations}
        dataKey="value"
        color="var(--destructive)"
        unit=""
      />
    </div>
  )
}

interface TrendCardProps {
  title: string
  description: string
  data: { label: string; value: number }[]
  dataKey: string
  color: string
  unit: string
  domain?: [number, number]
}

function TrendCard({ title, description, data, dataKey, color, domain }: TrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="label" tick={CHART_AXIS_TICK} interval="preserveStartEnd" />
              <YAxis tick={CHART_AXIS_TICK} domain={domain} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3 }}
                activeDot={{ r: 5 }}
                name={title}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
