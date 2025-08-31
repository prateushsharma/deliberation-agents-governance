import { AgentCommunications } from "@/components/agent-communications"

export default function CommunicationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Agent Communications</h1>
          <p className="text-slate-300 text-lg">
            Real-time ERC8004 messaging between AI agents during proposal analysis
          </p>
        </div>

        <AgentCommunications />
      </div>
    </div>
  )
}
