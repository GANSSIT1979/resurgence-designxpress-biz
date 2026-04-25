import { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, ScrollView } from 'react-native'
import { getCreatorEarnings, requestCreatorPayout } from '../../src/lib/earnings'

function money(cents: number) {
  return `₱${((cents || 0) / 100).toLocaleString()}`
}

export default function MobileEarningsScreen() {
  const creatorProfileId = 'REPLACE_WITH_AUTH_CREATOR_PROFILE_ID'
  const [data, setData] = useState<any>(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    const res = await getCreatorEarnings(creatorProfileId)
    setData(res)
  }

  async function submitPayout() {
    const amountCents = Math.round(Number(amount) * 100)
    await requestCreatorPayout({ creatorProfileId, amountCents })
    setMessage('Payout request submitted')
    await load()
  }

  useEffect(() => { load().catch(console.error) }, [])

  if (!data) return <Text style={{ padding: 20 }}>Loading earnings...</Text>

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Earnings</Text>
      <Text style={{ marginTop: 20 }}>Available</Text>
      <Text style={{ fontSize: 32, fontWeight: '800' }}>{money(data.availableCents)}</Text>

      <View style={{ marginTop: 24, gap: 12 }}>
        <Text>Total Commission: {money(data.summary.totalCommissionCents)}</Text>
        <Text>Revenue Driven: {money(data.summary.totalOrderAmountCents)}</Text>
        <Text>Views: {data.summary.views}</Text>
        <Text>Clicks: {data.summary.clicks}</Text>
        <Text>Purchases: {data.summary.purchases}</Text>
        <Text>Conversion Rate: {((data.summary.conversionRate || 0) * 100).toFixed(2)}%</Text>
      </View>

      <View style={{ marginTop: 28 }}>
        <Text style={{ fontWeight: '700' }}>Request Payout</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Amount in PHP"
          style={{ borderWidth: 1, padding: 12, marginTop: 10, borderRadius: 10 }}
        />
        <Button title="Withdraw" onPress={submitPayout} />
        {message && <Text style={{ marginTop: 10 }}>{message}</Text>}
      </View>
    </ScrollView>
  )
}
