import { memo } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui'
import { enrichResources, getEffectiveResource } from '../lib/resourceRegistry'
import type { ResourceLink } from '../types'

interface ResourceLinksProps {
  resources?: ResourceLink[]
}

const TYPE_LABELS: Record<NonNullable<ResourceLink['type']>, string> = {
  article: 'Article',
  video: 'Video',
  docs: 'Docs',
  problem: 'Problem',
}

export const ResourceLinks = memo(function ResourceLinks({ resources }: ResourceLinksProps) {
  if (!resources?.length) return null

  const validated = enrichResources(resources)

  return (
    <ul className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
      {validated.map((resource) => {
        const effective = getEffectiveResource(resource)
        const showWarning =
          effective.isFallback || resource.status === 'broken' || resource.status === 'deprecated'

        return (
          <li key={resource.id}>
            <a
              href={effective.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full flex-wrap items-center gap-2 text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="break-words">{effective.title}</span>
              {resource.type ? (
                <Badge variant="outline" className="text-[10px]">
                  {TYPE_LABELS[resource.type]}
                </Badge>
              ) : null}
              {showWarning ? (
                <Badge variant="warning" className="gap-1 text-[10px]">
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                  {effective.isFallback ? 'Fallback' : 'Unavailable'}
                </Badge>
              ) : null}
            </a>
            {effective.isFallback ? (
              <p className="ml-6 mt-0.5 text-[11px] text-muted-foreground">
                Original link unavailable — showing verified alternative.
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
})
