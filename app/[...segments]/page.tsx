import { PortalPage } from '@/components/portal-page'

export default async function InnerPage({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params
  return <PortalPage segments={segments} />
}
