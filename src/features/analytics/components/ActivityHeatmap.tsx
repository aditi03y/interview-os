import { Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { getHeatmapColor } from '../lib/computeAnalytics'
import { CHART_TOOLTIP_STYLE } from '../lib/chartTheme'
import type { HeatmapCell } from '../types'

interface ActivityHeatmapProps {
  cells: HeatmapCell[]
}

interface HeatmapDot {
  x: number
  y: number
  z: number
  date: string
  dayLabel: string
  weekLabel: string
  studyMinutes: number
  dsaSolves: number
  testsCompleted: number
  fill: string
}

export function ActivityHeatmap({ cells }: ActivityHeatmapProps) {
  const scatterData: HeatmapDot[] = cells.map((cell) => ({
    x: cell.dayIndex,
    y: cell.weekIndex,
    z: Math.max(1, cell.intensity),
    date: cell.date,
    dayLabel: cell.dayLabel,
    weekLabel: cell.weekLabel,
    studyMinutes: cell.studyMinutes,
    dsaSolves: cell.dsaSolves,
    testsCompleted: cell.testsCompleted,
    fill: getHeatmapColor(cell.intensity),
  }))

  const dayTicks = [0, 1, 2, 3, 4, 5, 6]
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekCount = Math.max(...cells.map((c) => c.weekIndex), 0) + 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Heatmap</CardTitle>
        <CardDescription>
          12-week study intensity — darker cells mean more activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <XAxis
                type="number"
                dataKey="x"
                domain={[-0.5, 6.5]}
                ticks={dayTicks}
                tickFormatter={(v) => dayLabels[v] ?? ''}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[-0.5, weekCount - 0.5]}
                reversed
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                tickFormatter={(v) => `W${v + 1}`}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <ZAxis type="number" dataKey="z" range={[120, 120]} />
              <Tooltip
                content={<HeatmapTooltip />}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter
                data={scatterData}
                shape={(props: HeatmapShapeProps) => <HeatmapCellShape {...props} />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 25, 50, 75, 100].map((level) => (
            <span
              key={level}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: getHeatmapColor(level) }}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface HeatmapShapeProps {
  cx?: number
  cy?: number
  payload?: HeatmapDot
}

function HeatmapCellShape({ cx = 0, cy = 0, payload }: HeatmapShapeProps) {
  const size = 14
  return (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      rx={2}
      fill={payload?.fill ?? 'var(--muted)'}
      stroke="var(--border)"
      strokeWidth={0.5}
    />
  )
}

function HeatmapTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: HeatmapDot }>
}) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload

  return (
    <div style={CHART_TOOLTIP_STYLE} className="px-3 py-2">
      <p className="font-medium">{d.date}</p>
      <p className="text-muted-foreground">{d.dayLabel} · {d.weekLabel}</p>
      <p className="mt-1">Study: {d.studyMinutes}m</p>
      <p>DSA solves: {d.dsaSolves}</p>
      <p>Tests: {d.testsCompleted}</p>
    </div>
  )
}
