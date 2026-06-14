import { useParams } from 'react-router-dom'
import { AdminTestDetailPage } from './AdminTestDetailPage'

/** Remount the editor when switching between tests (or new ↔ edit) so form state cannot leak. */
export function AdminTestDetailRoute() {
  const { testId } = useParams<{ testId: string }>()
  return <AdminTestDetailPage key={testId ?? 'new'} />
}
