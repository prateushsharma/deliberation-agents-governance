import { Code, Database, Cpu, Network } from "lucide-react"

export function TechnicalSpecs() {
  return (
    <section className="px-6 py-24 lg:px-8 bg-slate-900/50">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Technical Architecture</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
            Built on cutting-edge blockchain technology with real AI integration and economic incentive mechanisms.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Smart Contracts */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Code className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Smart Contracts</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">AIAgentStaking.sol</h4>
                <p className="text-slate-300 text-sm mb-3">
                  Manages agent registration, cBTC staking, and analysis submission with reputation tracking.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">registerAgent()</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">submitAnalysis()</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">slashStake()</span>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">ConsensusEngine.sol</h4>
                <p className="text-slate-300 text-sm mb-3">
                  Weighted consensus algorithm and automatic payment execution for approved proposals.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                    calculateConsensus()
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">executePayment()</span>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">ERC-8004 Messenger</h4>
                <p className="text-slate-300 text-sm mb-3">
                  Revolutionary ERC-8004 messaging protocol enables secure agent-to-agent communication on Citrea,
                  creating an immutable audit trail of all AI decisions and inter-agent discussions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">postMessage()</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">getThread()</span>
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">agentComm()</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI System */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="h-8 w-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">AI Agent System</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Groq AI Integration</h4>
                <p className="text-slate-300 text-sm mb-3">
                  Real AI reasoning using Groq's lightning-fast inference for specialized analysis.
                </p>
                <div className="text-xs text-slate-500 font-mono">llama3-8b-8192 model</div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Specialized Agents</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Risk Assessment</span>
                    <span className="text-red-400">RiskBot</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Financial Analysis</span>
                    <span className="text-blue-400">FinanceBot</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Community Impact</span>
                    <span className="text-green-400">CommunityBot</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Technical Feasibility</span>
                    <span className="text-yellow-400">TechBot</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Economic Incentives</h4>
                <p className="text-slate-300 text-sm">
                  Agents stake 0.001-0.002 cBTC per proposal. Accuracy tracking affects future rewards and reputation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Network & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Network className="h-6 w-6 text-orange-400" />
              <h4 className="text-lg font-semibold text-white">Citrea Bitcoin L2</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Network</span>
                <span className="text-white">Citrea Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chain ID</span>
                <span className="text-white">5115</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Currency</span>
                <span className="text-white">cBTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RPC</span>
                <span className="text-white text-xs">rpc.testnet.citrea.xyz</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-cyan-400" />
              <h4 className="text-lg font-semibold text-white">Performance Metrics</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Analysis Time</span>
                <span className="text-green-400">&lt; 1 minute</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consensus Speed</span>
                <span className="text-green-400">&lt; 5 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Execution</span>
                <span className="text-green-400">Automatic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transparency</span>
                <span className="text-green-400">ERC-8004 Auditable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
