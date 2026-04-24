import PartnerSafeAnalyticsSnapshotPage from '@/components/resurgence/PartnerSafeAnalyticsSnapshotPage'

type PageProps = {
  params: Promise<{ token: string }>
}

export default async function PartnerAnalyticsSnapshotRoute({ params }: PageProps) {
  const { token } = await params

  return <PartnerSafeAnalyticsSnapshotPage token={token} />
}
