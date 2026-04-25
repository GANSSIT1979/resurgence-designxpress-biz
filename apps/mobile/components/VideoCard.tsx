import { useRef } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { Video, ResizeMode } from 'expo-av'

const { height } = Dimensions.get('window')

export default function VideoCard({ item }: { item: any }) {
  const ref = useRef<Video>(null)

  return (
    <View style={{ height }}>
      <Video
        ref={ref}
        source={{ uri: item.videoUrl }}
        style={{ flex: 1 }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />

      <View
        style={{
          position: 'absolute',
          bottom: 80,
          left: 16,
          right: 16,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>
          {item.title}
        </Text>
      </View>
    </View>
  )
}
