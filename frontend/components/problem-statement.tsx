import { AlertTriangle, Clock, Users, DollarSign } from "lucide-react"

export function ProblemStatement() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">The Community Funding Crisis</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
            Small communities worldwide struggle with critical infrastructure decisions. Traditional governance is slow,
            opaque, and often ineffective.
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Slow Decisions</h3>
            <p className="text-slate-400 text-sm">
              Committee meetings take weeks while communities suffer without basic infrastructure
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Poor Analysis</h3>
            <p className="text-slate-400 text-sm">
              Human bias and limited expertise lead to suboptimal funding decisions
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Transparency</h3>
            <p className="text-slate-400 text-sm">Closed-door decisions erode community trust and accountability</p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Wasted Funds</h3>
            <p className="text-slate-400 text-sm">
              Poor oversight and analysis result in failed projects and lost resources
            </p>
          </div>
        </div>

        {/* Real Examples */}
        <div className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Real-World Impact</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-6">
              <div className="text-red-400 font-semibold mb-2">❌ Current Reality</div>
              <h4 className="text-white font-medium mb-2">Water Pump Emergency</h4>
              <p className="text-slate-300 text-sm mb-4">
                Village water pump breaks. Committee schedules meeting for next month. 150 families without clean water
                for weeks.
              </p>
              <div className="text-xs text-slate-500">Timeline: 3-4 weeks</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-6">
              <div className="text-yellow-400 font-semibold mb-2">⚠️ Traditional Process</div>
              <h4 className="text-white font-medium mb-2">Solar Panel Proposal</h4>
              <p className="text-slate-300 text-sm mb-4">
                School requests solar panels. Multiple committee meetings, political debates, limited technical
                expertise.
              </p>
              <div className="text-xs text-slate-500">Timeline: 2-3 months</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-6">
              <div className="text-green-400 font-semibold mb-2">✅ AI Governance</div>
              <h4 className="text-white font-medium mb-2">Bridge Repair</h4>
              <p className="text-slate-300 text-sm mb-4">
                Emergency bridge repair needed. AI agents analyze risk, cost, impact. Decision and payment in under 1
                hour.
              </p>
              <div className="text-xs text-slate-500">Timeline: &lt; 1 hour</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
