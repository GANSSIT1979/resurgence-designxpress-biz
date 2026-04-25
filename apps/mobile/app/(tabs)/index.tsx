import { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { api } from '../../src/lib/api'

export default function FeedScreen() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.feed()
      .then((res) => setData(res.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <ActivityIndicator />

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16 }}>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  )
}
