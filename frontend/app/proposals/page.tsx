import { ProposalList } from "@/components/proposal-list"
import { CreateProposalForm } from "@/components/create-proposal-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, List } from "lucide-react"

export default function ProposalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Community Proposals</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
            Submit infrastructure funding requests and watch AI agents analyze them in real-time. All proposals are
            transparent and decisions are made within minutes.
          </p>
        </div>

        {/* Tabs for Create vs View */}
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              View Proposals
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <ProposalList />
          </TabsContent>

          <TabsContent value="create">
            <CreateProposalForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
