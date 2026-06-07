import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { useSignUp } from '@/hooks/auth'
import { toast } from '@/lib/toast'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, isLoading, fieldError, clearFieldError } = useSignUp()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    clearFieldError()

    const result = await signUp({ fullName, email, password, confirmPassword })

    if (result.error) {
      setFormError(result.error.message)
      toast.error(result.error.message, 'Sign up failed')
      return
    }

    if (result.data.needsEmailConfirmation) {
      toast.info(
        'Check your email to confirm your account, then sign in.',
        'Account created',
        8000,
      )
      return
    }

    toast.success('Account created! Welcome to InterviewOS.')
    void navigate(ROUTES.dashboard, { replace: true })
  }

  const displayError = fieldError ?? formError

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start your SDE interview preparation journey</CardDescription>
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
            label="Full Name"
            autoComplete="name"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to={ROUTES.auth.login}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
