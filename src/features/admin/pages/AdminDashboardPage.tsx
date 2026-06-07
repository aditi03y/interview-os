import { Link } from 'react-router-dom'
import { BookOpen, FileText, Link2, Shield, TestTube2 } from 'lucide-react'
import { ROUTES } from '@/app/router/paths'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@/components/ui'

const ADMIN_SECTIONS = [
  {
    title: 'Test Engine',
    description: 'Create, edit, and deactivate tests. Manage MCQ, subjective, and coding questions.',
    href: ROUTES.admin.tests,
    icon: TestTube2,
  },
  {
    title: 'Test & AI Prompts',
    description: 'Edit guidance for question difficulty, type, and tone used when authoring tests.',
    href: ROUTES.admin.prompts,
    icon: FileText,
  },
  {
    title: 'Prompt Library',
    description: 'Add, publish, or remove prompts shown in the Prompt Library tool.',
    href: ROUTES.admin.prompts,
    icon: BookOpen,
  },
  {
    title: 'Study Resources',
    description: 'Manage resource URLs, fallbacks, and broken-link overrides for the study plan.',
    href: ROUTES.admin.resources,
    icon: Link2,
  },
]

export function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Console"
        description="Manage tests, content prompts, and resources shown to students."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-primary">
            <Shield className="h-4 w-4" aria-hidden />
            Admin access
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.title} to={section.href} className="block">
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">Open →</span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">First-time setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Admin uses the same login as students. Promote your account in Supabase SQL Editor:
          </p>
          <code className="block rounded-lg bg-muted p-3 text-xs">
            update public.users set app_role = &apos;admin&apos; where email = &apos;your@email.com&apos;;
          </code>
          <p>Apply migration <strong>20250606800000_admin_role.sql</strong> before using admin write features.</p>
        </CardContent>
      </Card>
    </div>
  )
}
