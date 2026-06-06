import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  /** Reset boundary when these values change */
  resetKeys?: readonly unknown[]
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[InterviewOS] Error boundary caught:', error, info)
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (!this.state.hasError) return

    const prevKeys = prevProps.resetKeys ?? []
    const nextKeys = this.props.resetKeys ?? []

    if (
      prevKeys.length !== nextKeys.length ||
      nextKeys.some((key, index) => key !== prevKeys[index])
    ) {
      this.setState({ hasError: false, error: null })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex min-h-[50vh] items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try again or return to the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error ? (
                <pre className="max-h-32 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  {this.state.error.message}
                </pre>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleReset}>
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Try again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = ROUTES.dashboard
                  }}
                >
                  <Home className="h-4 w-4" aria-hidden />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
