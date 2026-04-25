import Constants from 'expo-constants'
import { getToken } from './auth'
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://www.resurgence-dx.biz'
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken()
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
export function buildAffiliateUrl(input: { product?: any; postId?: string; creatorId?: string; affiliateCode?: string }) {
  const product = input.product || {}
  const base = product.checkoutUrl || product.url || `${API_URL}/shop/product/${product.slug || ''}`
  const url = new URL(base, API_URL)
  if (input.postId) url.searchParams.set('post', input.postId)
  if (input.creatorId) url.searchParams.set('creator', input.creatorId)
  if (input.affiliateCode) url.searchParams.set('ref', input.affiliateCode)
  return url.toString()
}
async function safePost(path: string, body: Record<string, unknown>) {
  try { return await apiFetch(path, { method: 'POST', body: JSON.stringify(body) }) } catch { return null }
}
export const api = {
  health: () => apiFetch('/api/health'),
  feed: () => apiFetch('/api/feed'),
  trackView: (postId: string) => safePost(`/api/feed/${postId}/view`, { source: 'mobile' }),
  likePost: (postId: string) => safePost(`/api/feed/${postId}/like`, { source: 'mobile' }),
  sharePost: (postId: string) => safePost(`/api/feed/${postId}/share`, { source: 'mobile' }),
  trackProductClick: (input: { postId?: string; productId?: string; creatorId?: string; affiliateCode?: string }) => safePost('/api/affiliate/events/click', { ...input, source: 'mobile-feed' }),
}
