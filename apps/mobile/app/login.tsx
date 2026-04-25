import { useState } from 'react'
import { View, TextInput, Button, Text } from 'react-native'
import { saveSession } from '../src/lib/auth'
import { apiFetch } from '../src/lib/api'
export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  async function handleLogin() {
    try {
      setError(null)
      const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      if (!res.token) throw new Error('Invalid login response')
      await saveSession(res.token, res.user)
    } catch (err: any) { setError(err.message) }
  }
  return <View style={{ padding: 20 }}><Text>Email</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" /><Text>Password</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry />{error && <Text style={{ color: 'red' }}>{error}</Text>}<Button title="Login" onPress={handleLogin} /></View>
}
