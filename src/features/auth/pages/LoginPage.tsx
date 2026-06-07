import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/paths'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui'
import { useSignIn } from '@/hooks/auth'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isLoading, fieldError, clearFieldError } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const from =
    (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    clearFieldError()

    const result = await signIn(email, password)
    if (result.error) {
      setFormError(result.error.message)
      toast.error(result.error.message, 'Sign in failed')
      return
    }

    toast.success('Welcome back! Redirecting to your dashboard.')
    const profile = useAuthStore.getState().user
    if (profile?.appRole === 'admin') {
      toast.info('You have admin access. Open Admin Console from the sidebar.', 'Admin')
    }
    void navigate(from, { replace: true })
  }

  const displayError = fieldError ?? formError

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue your interview prep</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {displayError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {displayError}
            </div>
          ) : null}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to={ROUTES.auth.signup}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
