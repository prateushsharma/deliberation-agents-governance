import { Button } from "@/components/ui/button"
import { ExternalLink, Activity, Users, Coins } from "lucide-react"

export function LiveDemo() {
  const contractAddresses = {
    staking: "0xaC855951321913A8dBBb7631A5DbcbcE2366570C",
    consensus: "0xd5D80311b62e32A7D519636796cEFB1C37757362",
    messenger: "0x7A26B68b9DFBeb0284076F4fC959e01044a21DCa",
  }

  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Live System Status</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
            All smart contracts are deployed and operational on Citrea testnet. The AI governance system is ready for
            real community proposals.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-green-400" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">LIVE</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">AI Agent Staking</h3>
            <p className="text-slate-300 text-sm mb-4">Agents register, stake cBTC, and submit analysis results</p>
            <div className="text-xs text-slate-500 font-mono break-all">{contractAddresses.staking}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-400" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">LIVE</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">Consensus Engine</h3>
            <p className="text-slate-300 text-sm mb-4">Calculates weighted consensus and triggers payments</p>
            <div className="text-xs text-slate-500 font-mono break-all">{contractAddresses.consensus}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <Coins className="h-8 w-8 text-purple-400" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 text-sm font-medium">LIVE</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">ERC-8004 Messenger</h3>
            <p className="text-slate-300 text-sm mb-4">Transparent audit trail of all AI decisions</p>
            <div className="text-xs text-slate-500 font-mono break-all">{contractAddresses.messenger}</div>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Experience AI Governance</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">For Community Members</h4>
              <p className="text-slate-300 text-sm">
                Submit real infrastructure proposals and watch AI agents analyze them in real-time.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit New Proposal</Button>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">For Observers</h4>
              <p className="text-slate-300 text-sm">
                Monitor live AI agent activity, consensus calculations, and payment executions.
              </p>
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                View Live Dashboard
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="https://explorer.testnet.citrea.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                View on Citrea Explorer
                <ExternalLink className="h-4 w-4" />
              </a>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">Chain ID: 5115</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">Currency: cBTC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
