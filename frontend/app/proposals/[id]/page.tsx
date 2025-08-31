import { ProposalDetail } from "@/components/proposal-detail"
import { notFound } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export default function ProposalDetailPage({ params }: Props) {
  const proposalId = Number.parseInt(params.id)

  if (isNaN(proposalId)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <ProposalDetail proposalId={proposalId} />
    </div>
  )
}
