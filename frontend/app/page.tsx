import { Hero } from "@/components/hero"
import { ProblemStatement } from "@/components/problem-statement"
import { SystemOverview } from "@/components/system-overview"
import { LiveDemo } from "@/components/live-demo"
import { TechnicalSpecs } from "@/components/technical-specs"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Hero />
      <ProblemStatement />
      <SystemOverview />
      <LiveDemo />
      <TechnicalSpecs />
    </main>
  )
}
