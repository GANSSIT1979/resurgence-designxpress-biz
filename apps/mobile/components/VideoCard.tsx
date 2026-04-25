import { useEffect, useRef, useState } from 'react'
import { View, Text, Dimensions, Pressable, Share, Linking } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { api, buildAffiliateUrl } from '../src/lib/api'
const { height } = Dimensions.get('window')
export default function VideoCard({ item, isActive }: { item: any; isActive: boolean }) {
  const ref = useRef<Video>(null)
  const [liked, setLiked] = useState(Boolean(item.likedByMe))
  const product = item.product || item.taggedProduct || item.products?.[0]
  useEffect(() => {
    if (isActive) { ref.current?.playAsync().catch(() => undefined); api.trackView(item.id).catch(() => undefined) }
    else ref.current?.pauseAsync().catch(() => undefined)
  }, [isActive, item.id])
  async function handleLike() { setLiked(v => !v); api.likePost(item.id).catch(() => undefined) }
  async function handleShare() {
    const url = item.shareUrl || `https://www.resurgence-dx.biz/feed/${item.slug || item.id}`
    await Share.share({ message: `${item.title || 'Resurgence'} ${url}` })
    api.sharePost(item.id).catch(() => undefined)
  }
  async function handleShop() {
    const url = buildAffiliateUrl({ product, postId: item.id, creatorId: item.creator?.id || item.creatorProfileId, affiliateCode: item.affiliateCode })
    api.trackProductClick({ postId: item.id, productId: product?.id, creatorId: item.creator?.id || item.creatorProfileId, affiliateCode: item.affiliateCode }).catch(() => undefined)
    await Linking.openURL(url)
  }
  return (
    <View style={{ height, backgroundColor: '#000' }}>
      <Video ref={ref} source={{ uri: item.videoUrl || item.mediaUrl || item.playbackUrl }} style={{ flex: 1 }} resizeMode={ResizeMode.COVER} isLooping />
      <View style={{ position: 'absolute', right: 16, bottom: 150, gap: 18 }}>
        <Pressable onPress={handleLike}><Text style={{ color: liked ? '#ff3b5c' : '#fff', fontSize: 30 }}>♥</Text></Pressable>
        <Pressable onPress={handleShare}><Text style={{ color: '#fff', fontSize: 26 }}>↗</Text></Pressable>
        {product && <Pressable onPress={handleShop}><Text style={{ color: '#fff', fontSize: 26 }}>🛒</Text></Pressable>}
      </View>
      <View style={{ position: 'absolute', bottom: 72, left: 16, right: 72 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>@{item.creator?.slug || item.creatorSlug || 'creator'}</Text>
        <Text style={{ color: '#fff', fontSize: 18, marginTop: 6 }} numberOfLines={2}>{item.title || item.caption || 'Featured drop'}</Text>
        {product && <Pressable onPress={handleShop} style={{ marginTop: 12, backgroundColor: '#fff', padding: 10, borderRadius: 999 }}><Text style={{ color: '#000', fontWeight: '700' }}>Shop {product.name || product.title || 'this look'}</Text></Pressable>}
      </View>
    </View>
  )
}
