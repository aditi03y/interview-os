import { CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ScoreGauge } from './ScoreGauge'
import { RepoMetadataPanel } from './RepoMetadataPanel'
import type { RepoEvaluationReport } from '../types'

interface EvaluationReportProps {
  report: RepoEvaluationReport
}

export function EvaluationReport({ report }: EvaluationReportProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {report.owner}/{report.repoName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluated {new Date(report.reviewedAt).toLocaleString()}
          </p>
        </div>
        <Badge variant="primary" className="text-base">
          Quality {report.qualityScore}/100
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreGauge label="Quality Score" score={report.qualityScore} description="Overall" />
        <ScoreGauge label="Documentation" score={report.documentationScore} description="README & docs" />
        <ScoreGauge label="Structure" score={report.structureScore} description="Organization" />
        <ScoreGauge label="Engineering" score={report.engineeringScore} description="Best practices" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailSection title="Documentation Analysis" content={report.sections.documentation} />
        <DetailSection title="Structure Analysis" content={report.sections.structure} />
        <DetailSection title="Engineering Analysis" content={report.sections.engineering} />
        <DetailSection title="Commit Activity" content={report.sections.commitActivity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListSection
          title="Strengths"
          icon={CheckCircle2}
          items={report.strengths}
          variant="success"
        />
        <ListSection
          title="Improvements"
          icon={Lightbulb}
          items={report.improvements}
          variant="warning"
        />
      </div>

      {report.sections.recommendations.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {report.sections.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Fetched Repository Data</h3>
        <RepoMetadataPanel snapshot={report.snapshot} />
      </section>
    </div>
  )
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {content || 'No analysis available.'}
        </p>
      </CardContent>
    </Card>
  )
}

function ListSection({
  title,
  icon: Icon,
  items,
  variant,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
  variant: 'success' | 'warning'
}) {
  const color = variant === 'success' ? 'text-success' : 'text-warning-foreground'

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-base ${color}`}>
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className={color}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None identified.</p>
        )}
      </CardContent>
    </Card>
  )
}
