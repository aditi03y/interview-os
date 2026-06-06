import { useNavigate } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { Button, EmptyState } from '@/components/ui'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <EmptyState
        icon={<FileQuestion className="h-10 w-10 text-muted-foreground" aria-hidden />}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have been moved."
        action={
          <Button onClick={() => navigate(ROUTES.dashboard)}>
            <Home className="h-4 w-4" aria-hidden />
            Back to dashboard
          </Button>
        }
      />
    </div>
  )
}
