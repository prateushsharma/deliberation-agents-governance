import { Brain, Shield, Zap, Eye, Bitcoin, MessageSquare } from "lucide-react"

export function SystemOverview() {
  return (
    <section className="px-6 py-24 lg:px-8 bg-slate-800/30">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">How AI Governance Works</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
            Four specialized AI agents stake real cBTC and compete to provide the best analysis. Economic incentives
            ensure honest, accurate governance decisions with full ERC-8004 transparency.
          </p>
        </div>

        {/* Process Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white">Proposal Submitted</h3>
              </div>
              <p className="text-slate-300 mb-6">
                Community member submits infrastructure funding request with details, budget, and urgency level.
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-2">Example:</div>
                <div className="text-white font-medium">"Water pump repair - 0.05 cBTC"</div>
                <div className="text-slate-300 text-sm">Affects 150 families, urgent priority</div>
              </div>
            </div>
            {/* Arrow */}
            <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="w-0 h-0 border-l-4 border-l-purple-500 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-6 -mt-0.5"></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white">AI Agents Analyze</h3>
              </div>
              <p className="text-slate-300 mb-6">
                Four specialized agents stake cBTC and analyze the proposal using advanced AI reasoning. All agent
                communication happens via ERC-8004 messaging on Citrea.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-red-400" />
                  <span className="text-slate-300">Risk Assessment Agent</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">Financial Analysis Agent</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-green-400" />
                  <span className="text-slate-300">Community Impact Agent</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-slate-300">Technical Feasibility Agent</span>
                </div>
              </div>
            </div>
            {/* Arrow */}
            <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
              <div className="w-0 h-0 border-l-4 border-l-cyan-500 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-6 -mt-0.5"></div>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-green-500/10 rounded-2xl p-8 border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white">Consensus & Payment</h3>
              </div>
              <p className="text-slate-300 mb-6">
                Weighted consensus algorithm calculates final decision. Approved proposals trigger automatic cBTC
                payments.
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">Consensus Formula:</span>
                  <span className="text-green-400 text-sm font-mono">✓ APPROVED</span>
                </div>
                <div className="text-xs text-slate-500">Stake × Accuracy × Confidence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-700/30 rounded-xl p-6">
            <Bitcoin className="h-8 w-8 text-orange-400 mb-4" />
            <h4 className="text-white font-semibold mb-2">Economic Incentives</h4>
            <p className="text-slate-300 text-sm">
              Agents stake real cBTC on Citrea. Accurate analysis increases reputation and rewards. Poor decisions
              result in stake slashing.
            </p>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-6">
            <MessageSquare className="h-8 w-8 text-blue-400 mb-4" />
            <h4 className="text-white font-semibold mb-2">ERC-8004 Transparency</h4>
            <p className="text-slate-300 text-sm">
              Revolutionary ERC-8004 messaging protocol on Citrea creates immutable audit trail of all agent
              communications. Every decision and reasoning is publicly verifiable on Bitcoin L2.
            </p>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-6">
            <Zap className="h-8 w-8 text-purple-400 mb-4" />
            <h4 className="text-white font-semibold mb-2">Instant Execution</h4>
            <p className="text-slate-300 text-sm">
              No waiting for human committees. AI consensus triggers automatic Bitcoin payments within minutes of
              approval.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
