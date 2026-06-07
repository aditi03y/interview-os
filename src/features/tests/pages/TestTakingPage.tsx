import { useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { ProctorBanner, useAntiCheatMonitor } from '@/features/anti-cheat'
import { EmptyState, Spinner } from '@/components/ui'
import { useTestAttempt } from '../hooks/useTestAttempt'
import { TestTakingLayout } from '../components/TestTakingLayout'

export function TestTakingPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { user } = useAuth()
  const {
    attempt,
    questions,
    answers,
    currentIndex,
    currentQuestion,
    loading,
    submitting,
    error,
    formattedTime,
    remainingSeconds,
    timerProgress,
    overallFormattedTime,
    overallRemainingSeconds,
    overallTimerProgress,
    sectionTimersEnabled,
    currentSection,
    sectionIndex,
    sectionCount,
    sectionPlan,
    canAdvanceSectionEarly,
    advanceSectionEarly,
    answeredCount,
    setAnswer,
    setCurrentIndex,
    goNext,
    goPrev,
    submit,
  } = useTestAttempt(attemptId)

  const { violationCount, isFullscreen, enterFullscreen } = useAntiCheatMonitor({
    userId: user?.id,
    attemptId,
    enabled: Boolean(attempt?.status === 'in_progress'),
  })

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !attempt || !currentQuestion) {
    return (
      <EmptyState
        title="Unable to load test"
        description={error ?? 'This attempt may have expired or been removed.'}
        icon={<AlertCircle className="h-10 w-10 text-destructive" />}
      />
    )
  }

  return (
    <div className="space-y-4">
      <ProctorBanner
        violationCount={violationCount}
        isFullscreen={isFullscreen}
        onEnterFullscreen={enterFullscreen}
      />
      <TestTakingLayout
        title={attempt.definition?.title ?? 'Test'}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        formattedTime={formattedTime}
        timerProgress={timerProgress}
        remainingSeconds={remainingSeconds}
        answeredCount={answeredCount}
        submitting={submitting}
        sectionTimersEnabled={sectionTimersEnabled}
        currentSectionLabel={currentSection?.section.label}
        sectionIndex={sectionIndex}
        sectionCount={sectionCount}
        overallFormattedTime={sectionTimersEnabled ? overallFormattedTime : undefined}
        overallTimerProgress={overallTimerProgress}
        overallRemainingSeconds={overallRemainingSeconds}
        sectionPlan={sectionPlan}
        canAdvanceSectionEarly={canAdvanceSectionEarly}
        onAnswer={setAnswer}
        onSelectQuestion={setCurrentIndex}
        onPrev={goPrev}
        onNext={goNext}
        onAdvanceSection={advanceSectionEarly}
        onSubmit={() => void submit()}
      />
    </div>
  )
}
