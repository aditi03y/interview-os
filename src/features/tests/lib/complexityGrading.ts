const COMPLEXITY_MARK_EACH = 1

export { COMPLEXITY_MARK_EACH }

export function normalizeComplexity(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/×/g, '*')
    .replace(/log2/g, 'log')
    .replace(/log_2/g, 'log')
}

export function gradeComplexityAnswer(
  submitted: string | undefined,
  expected: string | undefined,
): { correct: boolean; points: number } {
  const sub = normalizeComplexity(submitted ?? '')
  const exp = normalizeComplexity(expected ?? '')

  if (!sub) return { correct: false, points: 0 }
  if (!exp) return { correct: false, points: 0 }

  if (sub === exp) return { correct: true, points: COMPLEXITY_MARK_EACH }

  const aliases = buildAliases(exp)
  const correct = aliases.has(sub)
  return { correct, points: correct ? COMPLEXITY_MARK_EACH : 0 }
}

function buildAliases(expected: string): Set<string> {
  const set = new Set<string>([expected])
  if (expected === 'o(1)') {
    set.add('o(1)')
    set.add('constant')
  }
  if (expected === 'o(n)') {
    set.add('o(n)')
    set.add('linear')
  }
  if (expected === 'o(nlogn)') {
    set.add('o(nlogn)')
    set.add('o(n*logn)')
    set.add('nlogn')
  }
  if (expected === 'o(n^2)' || expected === 'o(n2)') {
    set.add('o(n^2)')
    set.add('o(n2)')
    set.add('quadratic')
  }
  return set
}

export function complexityMarksForQuestion(hasExpected: boolean): number {
  return hasExpected ? COMPLEXITY_MARK_EACH * 2 : 0
}
