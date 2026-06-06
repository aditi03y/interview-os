import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui'
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

export function ResourceLinks({ resources }: ResourceLinksProps) {
  if (!resources?.length) return null

  return (
    <ul className="mt-2 space-y-1.5">
      {resources.map((resource) => (
        <li key={resource.id}>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span>{resource.title}</span>
            {resource.type ? (
              <Badge variant="outline" className="text-[10px]">
                {TYPE_LABELS[resource.type]}
              </Badge>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  )
}
