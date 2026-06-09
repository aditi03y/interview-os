import type { CodingMetadata, CodingTestCase } from '../types'

export interface CodingTestCaseResult {
  index: number
  hidden: boolean
  passed: boolean
  input: Record<string, unknown>
  expected: unknown
  actual: unknown | null
  error: string | null
}

export interface CodingTestRunSummary {
  results: CodingTestCaseResult[]
  passed: number
  total: number
}

export const CODING_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
] as const

export type CodingLanguageId = (typeof CODING_LANGUAGES)[number]['id']

export function getTestCases(meta: CodingMetadata): CodingTestCase[] {
  return meta.testCases ?? []
}

export function getVisibleTestCases(meta: CodingMetadata): CodingTestCase[] {
  return getTestCases(meta).filter((tc) => !tc.hidden)
}

export function getHiddenTestCases(meta: CodingMetadata): CodingTestCase[] {
  return getTestCases(meta).filter((tc) => tc.hidden)
}

export function getSupportedLanguages(meta: CodingMetadata): CodingLanguageId[] {
  const langs = meta.languages?.length ? meta.languages : ['javascript']
  return langs.filter((l): l is CodingLanguageId =>
    CODING_LANGUAGES.some((opt) => opt.id === l),
  )
}

export function getStarterCode(
  question: { starterCode: string | null; metadata: CodingMetadata | Record<string, unknown> },
  language: CodingLanguageId,
): string {
  const meta = question.metadata as CodingMetadata
  const byLang = meta.starterCodeByLanguage?.[language]
  if (byLang?.trim()) return byLang
  if (language === 'javascript' && question.starterCode?.trim()) return question.starterCode
  return defaultStarter(language, meta.functionName ?? 'solve')
}

function defaultStarter(language: CodingLanguageId, functionName: string): string {
  switch (language) {
    case 'python':
      return `def ${functionName}(*args):\n    # your code\n    pass\n`
    case 'java':
      return `class Solution {\n    public Object ${functionName}(Object... args) {\n        // your code\n        return null;\n    }\n}\n`
    case 'cpp':
      return `// implement ${functionName}\n`
    default:
      return `function ${functionName}(...args) {\n  // your code\n}\n`
  }
}

export function runCodingTestSuite(
  code: string,
  meta: CodingMetadata,
  options: { includeHidden?: boolean; language?: string } = {},
): CodingTestRunSummary {
  const language = options.language ?? 'javascript'
  const cases = getTestCases(meta).filter((tc) => options.includeHidden || !tc.hidden)

  const results: CodingTestCaseResult[] = cases.map((testCase) => {
    const fullIndex = getTestCases(meta).indexOf(testCase)
    try {
      if (language !== 'javascript') {
        return {
          index: fullIndex,
          hidden: Boolean(testCase.hidden),
          passed: false,
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          error: `In-browser grading supports JavaScript only. Selected: ${language}.`,
        }
      }

      const fn = new Function(
        `${code}\nreturn typeof ${meta.functionName} === 'function' ? ${meta.functionName} : null;`,
      )()
      if (typeof fn !== 'function') {
        return {
          index: fullIndex,
          hidden: Boolean(testCase.hidden),
          passed: false,
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          error: `Function "${meta.functionName}" not found in submission.`,
        }
      }

      const args = Object.values(testCase.input)
      const actual = fn(...args)
      const passed = deepEqual(actual, testCase.expected)
      return {
        index: fullIndex,
        hidden: Boolean(testCase.hidden),
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        error: passed ? null : 'Output did not match expected result.',
      }
    } catch (err) {
      return {
        index: fullIndex,
        hidden: Boolean(testCase.hidden),
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: null,
        error: err instanceof Error ? err.message : 'Runtime error',
      }
    }
  })

  const passed = results.filter((r) => r.passed).length
  return { results, passed, total: results.length }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
}
