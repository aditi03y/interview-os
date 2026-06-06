import { Link } from 'react-router-dom'
import { Bot, Map, TreePine } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '@/app/router'

const ACTIONS = [
  {
    id: 'study',
    label: 'Continue Study Plan',
    description: 'Pick up where you left off',
    icon: Map,
    path: ROUTES.studyPlan,
  },
  {
    id: 'dsa',
    label: 'Log a Problem',
    description: 'Add your latest DSA solve',
    icon: TreePine,
    path: ROUTES.dsaTracker,
  },
  {
    id: 'mentor',
    label: 'Ask AI Mentor',
    description: 'Get help on a concept',
    icon: Bot,
    path: ROUTES.aiMentor,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump into your most common tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.id} to={action.path}>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 px-4 py-3"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
