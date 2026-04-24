import SponsorAnalyticsSharePage from '@/components/resurgence/SponsorAnalyticsSharePage'

type PageProps = {
  params: Promise<{ token: string }>
}

export default async function SponsorAnalyticsShareRoute({ params }: PageProps) {
  const { token } = await params

  return <SponsorAnalyticsSharePage token={token} />
}
