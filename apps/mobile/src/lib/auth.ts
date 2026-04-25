import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'resurgence.auth.token'
const USER_KEY = 'resurgence.auth.user'

export type MobileUser = {
  id: string
  email?: string
  name?: string
  role?: string
}

export async function saveSession(token: string, user?: MobileUser) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
  if (user) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
  }
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function getStoredUser(): Promise<MobileUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as MobileUser
  } catch {
    return null
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(USER_KEY)
}
