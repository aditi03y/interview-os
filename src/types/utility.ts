/** Shared TypeScript utility types for strict, reusable patterns */

export type NonEmptyArray<T> = [T, ...T[]]

export type DeepReadonly<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

export type ValueOf<T> = T[keyof T]

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`)
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}
