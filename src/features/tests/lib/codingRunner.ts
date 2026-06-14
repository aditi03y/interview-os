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
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
] as const

export type CodingLanguageId = (typeof CODING_LANGUAGES)[number]['id']

export const DEFAULT_CODING_LANGUAGE: CodingLanguageId = 'cpp'

export const DEFAULT_CODING_LANGUAGES: CodingLanguageId[] = CODING_LANGUAGES.map(
  (lang) => lang.id,
)

/** Languages that can execute test cases in the browser (legacy JS runner). */
export const BROWSER_RUNNABLE_LANGUAGES = new Set<string>(['javascript'])

export function supportsBrowserTestExecution(language: string): boolean {
  return BROWSER_RUNNABLE_LANGUAGES.has(language)
}

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
  const langs = meta.languages?.length ? meta.languages : DEFAULT_CODING_LANGUAGES
  const filtered = langs.filter((l): l is CodingLanguageId =>
    CODING_LANGUAGES.some((opt) => opt.id === l),
  )
  return filtered.length ? filtered : DEFAULT_CODING_LANGUAGES
}

export function getStarterCode(
  question: { starterCode: string | null; metadata: CodingMetadata | Record<string, unknown> },
  language: CodingLanguageId,
): string {
  const meta = question.metadata as CodingMetadata
  const byLang = meta.starterCodeByLanguage?.[language]
  if (byLang?.trim()) return byLang
  if (question.starterCode?.trim() && !meta.starterCodeByLanguage) return question.starterCode
  return defaultStarter(language, meta.functionName ?? 'solve')
}

function defaultStarter(language: CodingLanguageId, functionName: string): string {
  switch (language) {
    case 'c':
      return `#include <stdio.h>\n\n// implement ${functionName}\n`
    case 'python':
      return `def ${functionName}(*args):\n    # your code\n    pass\n`
    case 'go':
      return `package main\n\n// implement ${functionName}\n`
    case 'cpp':
    default:
      return `#include <bits/stdc++.h>\nusing namespace std;\n\n// implement ${functionName}\n`
  }
}

export function runCodingTestSuite(
  code: string,
  meta: CodingMetadata,
  options: { includeHidden?: boolean; language?: string } = {},
): CodingTestRunSummary {
  const language = options.language ?? DEFAULT_CODING_LANGUAGE
  const cases = getTestCases(meta).filter((tc) => options.includeHidden || !tc.hidden)

  const results: CodingTestCaseResult[] = cases.map((testCase) => {
    const fullIndex = getTestCases(meta).indexOf(testCase)
    try {
      if (!supportsBrowserTestExecution(language)) {
        return {
          index: fullIndex,
          hidden: Boolean(testCase.hidden),
          passed: false,
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          error: `In-browser test execution is not available for ${language}. Complexity is still graded on submit.`,
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
