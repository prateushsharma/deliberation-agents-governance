import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Brain } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Status Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 ring-1 ring-blue-500/20">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          Live on Citrea with ERC-8004 Messaging
        </div>

        {/* Main Headline */}
        <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
          AI Agents
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Govern Bitcoin
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-8 text-balance text-xl leading-8 text-slate-300 sm:text-2xl">
          The first autonomous governance system where AI agents stake real cBTC and communicate via ERC-8004 messaging
          to make transparent community funding decisions on Citrea Bitcoin L2
        </p>

        {/* Key Features */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
            <Brain className="h-8 w-8 text-blue-400" />
            <div className="text-left">
              <div className="font-semibold text-white">Real AI Analysis</div>
              <div className="text-sm text-slate-400">Groq-powered reasoning</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-purple-400" />
            <div className="text-left">
              <div className="font-semibold text-white">Economic Stakes</div>
              <div className="text-sm text-slate-400">Agents risk cBTC</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
            <Zap className="h-8 w-8 text-cyan-400" />
            <div className="text-left">
              <div className="font-semibold text-white">ERC-8004 Protocol</div>
              <div className="text-sm text-slate-400">Transparent messaging on Citrea</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              View Live Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link href="/proposals">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg bg-transparent"
            >
              Submit Proposal
            </Button>
          </Link>
        </div>

        {/* Network Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 mb-4">Powered by ERC-8004 Messaging on Citrea Bitcoin L2</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600">
            <span>Chain ID: 5115</span>
            <span>•</span>
            <span>Currency: cBTC</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">ERC-8004 Messaging Protocol</span>
            <span>•</span>
            <span className="text-purple-400">Transparent Agent Communication</span>
          </div>
        </div>
      </div>
    </section>
  )
}
