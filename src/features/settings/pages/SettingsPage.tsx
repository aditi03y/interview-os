import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Monitor, Moon, Sun } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
} from '@/components/ui'
import { useAuth, useSignOut } from '@/hooks/auth'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores'
import { useThemeStore } from '@/stores'
import type { ThemeMode, UserProfile } from '@/types'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
]

function ProfileForm({ user }: { user: UserProfile }) {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [college, setCollege] = useState(user.college ?? '')
  const [targetRole, setTargetRole] = useState(user.targetRole ?? '')
  const [githubUsername, setGithubUsername] = useState(user.githubUsername ?? '')
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    const result = await updateProfile({
      full_name: fullName.trim() || null,
      college: college.trim() || null,
      target_role: targetRole.trim() || null,
      github_username: githubUsername.trim() || null,
    })

    if (result.error) {
      setSaveError(result.error.message)
      toast.error(result.error.message, 'Profile update failed')
      return
    }

    toast.success('Your profile has been updated.')
  }

  return (
    <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-4">
      {saveError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {saveError}
        </div>
      ) : null}

      <Input
        label="Full Name"
        placeholder="Your name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        label="College"
        placeholder="IIT / Engineering College"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
      />
      <Input
        label="Target Role"
        placeholder="SDE Intern / New Grad"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
      />
      <Input
        label="GitHub Username"
        placeholder="your-username"
        value={githubUsername}
        onChange={(e) => setGithubUsername(e.target.value)}
      />
      <Button type="submit" isLoading={isLoading}>
        Save Profile
      </Button>
    </form>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { signOut, isLoading: isSigningOut } = useSignOut()
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.error) {
      toast.error(result.error.message, 'Sign out failed')
      return
    }

    toast.success('You have been signed out.')
    void navigate(ROUTES.auth.login, { replace: true })
  }

  const handleThemeChange = (themeMode: ThemeMode) => {
    setMode(themeMode)
    toast.info(`Theme set to ${themeMode}.`, 'Appearance updated')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your profile and application preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal and academic details</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? <ProfileForm key={user.updatedAt} user={user} /> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how InterviewOS looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ mode: themeMode, label, icon: Icon }) => (
              <button
                key={themeMode}
                type="button"
                onClick={() => handleThemeChange(themeMode)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  mode === themeMode
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:bg-accent',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Authentication and session management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={user?.email ?? ''}
            disabled
          />
          <Button variant="destructive" onClick={() => void handleSignOut()} isLoading={isSigningOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
