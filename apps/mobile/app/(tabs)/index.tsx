import { useEffect, useRef, useState } from 'react'
import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import VideoCard from '../../components/VideoCard'
import { api } from '../../src/lib/api'
const { height } = Dimensions.get('window')
export default function FeedScreen() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  useEffect(() => { api.feed().then(res => setData(res.posts || [])).finally(() => setLoading(false)) }, [])
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => { if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index) }).current
  if (loading) return <ActivityIndicator />
  return <FlatList data={data} pagingEnabled snapToInterval={height} decelerationRate="fast" showsVerticalScrollIndicator={false} keyExtractor={(item) => item.id} renderItem={({ item, index }) => <VideoCard item={item} isActive={index === activeIndex} />} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={{ itemVisiblePercentThreshold: 80 }} />
}
