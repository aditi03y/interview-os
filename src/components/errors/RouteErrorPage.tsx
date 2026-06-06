import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export function RouteErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Unexpected error'

  const message = isRouteErrorResponse(error)
    ? error.data?.toString() ?? 'The page could not be loaded.'
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Reload page
          </Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.dashboard)}>
            <Home className="h-4 w-4" aria-hidden />
            Go to dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
