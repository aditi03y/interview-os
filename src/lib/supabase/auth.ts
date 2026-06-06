import type { Session, User } from '@supabase/supabase-js'
import type { UserProfile, ApiResult } from '@/types'
import type { UserRow, UserUpdate } from '@/types/database'
import { supabase } from './client'
import { mapPostgrestError, mapSupabaseError } from './errors'

export function mapUserRowToProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    college: row.college,
    targetRole: row.target_role,
    githubUsername: row.github_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapAuthUserToProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? '',
    fullName: (user.user_metadata.full_name as string | undefined) ?? null,
    avatarUrl: (user.user_metadata.avatar_url as string | undefined) ?? null,
    college: null,
    targetRole: null,
    githubUsername: null,
    createdAt: user.created_at,
    updatedAt: user.updated_at ?? user.created_at,
  }
}

export async function fetchUserProfile(userId: string): Promise<ApiResult<UserProfile>> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return { data: null, error: mapPostgrestError(error) }
  }

  return { data: mapUserRowToProfile(data), error: null }
}

export async function updateUserProfile(
  userId: string,
  updates: UserUpdate,
): Promise<ApiResult<UserProfile>> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    return { data: null, error: mapPostgrestError(error) }
  }

  return { data: mapUserRowToProfile(data), error: null }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<ApiResult<{ session: Session; user: UserProfile }>> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { data: null, error: mapSupabaseError(error) }
  }

  if (!data.session || !data.user) {
    return { data: null, error: { message: 'Sign in failed. No session returned.' } }
  }

  const profileResult = await fetchUserProfile(data.user.id)
  const profile = profileResult.data ?? mapAuthUserToProfile(data.user)

  return {
    data: { session: data.session, user: profile },
    error: null,
  }
}

export interface SignUpInput {
  email: string
  password: string
  fullName: string
}

export async function signUpWithEmail(
  input: SignUpInput,
): Promise<ApiResult<{ session: Session | null; user: UserProfile | null }>> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
    },
  })

  if (error) {
    return { data: null, error: mapSupabaseError(error) }
  }

  if (!data.user) {
    return { data: null, error: { message: 'Sign up failed. No user returned.' } }
  }

  let profile: UserProfile | null = null

  if (data.session) {
    const profileResult = await fetchUserProfile(data.user.id)
    profile = profileResult.data ?? mapAuthUserToProfile(data.user)
  }

  return {
    data: { session: data.session, user: profile },
    error: null,
  }
}

export async function signOutUser(): Promise<ApiResult<void>> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { data: null, error: mapSupabaseError(error) }
  }

  return { data: undefined, error: null }
}

export async function getCurrentSession(): Promise<ApiResult<Session | null>> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return { data: null, error: mapSupabaseError(error) }
  }

  return { data: data.session, error: null }
}

export function onAuthStateChange(
  callback: (session: Session | null) => void,
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })

  return subscription
}
