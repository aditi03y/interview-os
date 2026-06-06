import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { CHART_TOOLTIP_STYLE } from '../lib/chartTheme'
import type { RadarPoint } from '../types'

interface TopicRadarChartProps {
  data: RadarPoint[]
}

export function TopicRadarChart({ data }: TopicRadarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Topic Strength Radar</CardTitle>
        <CardDescription>Composite scores across your top topic areas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis
                dataKey="topic"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Radar
                name="Topic Score"
                dataKey="score"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.35}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
