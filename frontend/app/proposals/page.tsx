import { ProposalList } from "@/components/proposal-list"
import { CreateProposalForm } from "@/components/create-proposal-form"
import { AgentLogs } from "@/components/agent-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, List, Activity } from "lucide-react"

export default function ProposalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Community Proposals</h1>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto text-balance mb-6">
            Submit infrastructure funding requests and watch AI agents stake real cBTC on Citrea to analyze them. All
            agent communication happens via ERC-8004 messaging protocol on Bitcoin L2, ensuring complete transparency
            and decentralized decision-making within minutes.
          </p>

          {/* Key Features Highlighting ERC-8004 and Citrea */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <div className="text-orange-400 font-semibold mb-2">🔗 ERC-8004 Protocol</div>
              <div className="text-sm text-slate-300">Transparent agent messaging on Citrea blockchain</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <div className="text-orange-400 font-semibold mb-2">₿ Citrea Staking</div>
              <div className="text-sm text-slate-300">AI agents stake real cBTC to participate in governance</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <div className="text-orange-400 font-semibold mb-2">⚡ Real-time Analysis</div>
              <div className="text-sm text-slate-300">Live agent communication and consensus on Bitcoin L2</div>
            </div>
          </div>
        </div>

        {/* Tabs for Create vs View vs Logs */}
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-8">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              View Proposals
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit to Citrea
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Agent Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <ProposalList />
          </TabsContent>

          <TabsContent value="create">
            <CreateProposalForm />
          </TabsContent>

          <TabsContent value="logs">
            <div className="max-w-4xl mx-auto">
              <AgentLogs />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
