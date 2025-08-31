"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, TrendingUp, Users, Wrench, Brain, Bitcoin, BarChart3, Clock, ExternalLink } from "lucide-react"

interface AgentProfile {
  name: string
  specialization: string
  description: string
  expertise: string[]
  accuracy: number
  totalStake: number
  analysesCompleted: number
  averageConfidence: number
  strengths: string[]
  recentAnalyses: Array<{
    proposalId: number
    title: string
    recommendation: "APPROVE" | "REJECT" | "NEUTRAL"
    confidence: number
    date: string
  }>
  icon: React.ReactNode
  color: string
  address: string
}

const agentProfiles: AgentProfile[] = [
  {
    name: "RiskBot",
    specialization: "Risk Assessment",
    description:
      "Specialized in identifying and evaluating potential risks in community infrastructure projects. Analyzes technical feasibility, implementation challenges, and potential failure points.",
    expertise: ["Technical Risk Analysis", "Safety Assessment", "Compliance Evaluation", "Failure Mode Analysis"],
    accuracy: 92,
    totalStake: 0.0045,
    analysesCompleted: 23,
    averageConfidence: 87,
    strengths: ["Emergency Response", "Safety Protocols", "Risk Mitigation", "Technical Validation"],
    recentAnalyses: [
      {
        proposalId: 1,
        title: "Emergency Water Pump Repair",
        recommendation: "APPROVE",
        confidence: 90,
        date: "2024-01-15",
      },
      {
        proposalId: 3,
        title: "Community Garden Tools",
        recommendation: "APPROVE",
        confidence: 85,
        date: "2024-01-14",
      },
      {
        proposalId: 5,
        title: "Experimental Solar Array",
        recommendation: "REJECT",
        confidence: 92,
        date: "2024-01-13",
      },
    ],
    icon: <Shield className="h-6 w-6" />,
    color: "text-red-400",
    address: "0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234",
  },
  {
    name: "FinanceBot",
    specialization: "Financial Analysis",
    description:
      "Expert in budget analysis, cost-effectiveness evaluation, and financial impact assessment. Ensures optimal allocation of community treasury funds.",
    expertise: ["Budget Analysis", "Cost-Benefit Analysis", "Financial Planning", "Treasury Management"],
    accuracy: 88,
    totalStake: 0.0067,
    analysesCompleted: 31,
    averageConfidence: 83,
    strengths: ["Budget Optimization", "ROI Analysis", "Cost Estimation", "Financial Risk"],
    recentAnalyses: [
      {
        proposalId: 2,
        title: "School Solar Panel Installation",
        recommendation: "APPROVE",
        confidence: 78,
        date: "2024-01-15",
      },
      {
        proposalId: 1,
        title: "Emergency Water Pump Repair",
        recommendation: "APPROVE",
        confidence: 85,
        date: "2024-01-15",
      },
      {
        proposalId: 4,
        title: "Bridge Safety Repairs",
        recommendation: "NEUTRAL",
        confidence: 72,
        date: "2024-01-14",
      },
    ],
    icon: <TrendingUp className="h-6 w-6" />,
    color: "text-blue-400",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  },
  {
    name: "CommunityBot",
    specialization: "Community Impact",
    description:
      "Focuses on evaluating the social impact and community benefits of proposed projects. Prioritizes equity, accessibility, and long-term community development.",
    expertise: ["Social Impact Analysis", "Community Engagement", "Equity Assessment", "Stakeholder Analysis"],
    accuracy: 95,
    totalStake: 0.0089,
    analysesCompleted: 28,
    averageConfidence: 91,
    strengths: ["Community Needs", "Social Equity", "Public Benefit", "Stakeholder Impact"],
    recentAnalyses: [
      {
        proposalId: 1,
        title: "Emergency Water Pump Repair",
        recommendation: "APPROVE",
        confidence: 95,
        date: "2024-01-15",
      },
      {
        proposalId: 3,
        title: "Community Garden Tools",
        recommendation: "APPROVE",
        confidence: 88,
        date: "2024-01-14",
      },
      {
        proposalId: 2,
        title: "School Solar Panel Installation",
        recommendation: "APPROVE",
        confidence: 92,
        date: "2024-01-14",
      },
    ],
    icon: <Users className="h-6 w-6" />,
    color: "text-green-400",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  {
    name: "TechBot",
    specialization: "Technical Feasibility",
    description:
      "Evaluates the technical aspects of infrastructure projects, including implementation complexity, resource requirements, and long-term maintenance needs.",
    expertise: ["Technical Architecture", "Implementation Planning", "Resource Assessment", "Maintenance Analysis"],
    accuracy: 90,
    totalStake: 0.0054,
    analysesCompleted: 26,
    averageConfidence: 86,
    strengths: ["Technical Design", "Implementation", "System Integration", "Maintenance Planning"],
    recentAnalyses: [
      {
        proposalId: 2,
        title: "School Solar Panel Installation",
        recommendation: "APPROVE",
        confidence: 88,
        date: "2024-01-15",
      },
      {
        proposalId: 1,
        title: "Emergency Water Pump Repair",
        recommendation: "APPROVE",
        confidence: 88,
        date: "2024-01-15",
      },
      {
        proposalId: 6,
        title: "Advanced Quantum Lab",
        recommendation: "REJECT",
        confidence: 94,
        date: "2024-01-13",
      },
    ],
    icon: <Wrench className="h-6 w-6" />,
    color: "text-yellow-400",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
]

export function AgentProfiles() {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "APPROVE":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "REJECT":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">AI Agent Profiles</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
          Meet the specialized AI agents that analyze community proposals. Each agent has unique expertise and stakes
          real cBTC to ensure honest analysis.
        </p>
      </div>

      {/* Agent Profiles */}
      <div className="space-y-8">
        {agentProfiles.map((agent) => (
          <Card key={agent.name} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-slate-700/50 rounded-lg ${agent.color}`}>{agent.icon}</div>
                  <div>
                    <CardTitle className="text-white text-2xl">{agent.name}</CardTitle>
                    <CardDescription className="text-slate-300 text-lg">{agent.specialization}</CardDescription>
                    <p className="text-slate-400 mt-2 max-w-2xl">{agent.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{agent.accuracy}%</div>
                  <div className="text-slate-400 text-sm">Accuracy</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Bitcoin className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{agent.totalStake.toFixed(4)}</div>
                  <div className="text-slate-400 text-sm">Total Stake (cBTC)</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{agent.analysesCompleted}</div>
                  <div className="text-slate-400 text-sm">Analyses Completed</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Brain className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{agent.averageConfidence}%</div>
                  <div className="text-slate-400 text-sm">Avg Confidence</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Clock className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">24/7</div>
                  <div className="text-slate-400 text-sm">Availability</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expertise */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Core Expertise</h4>
                  <div className="space-y-2">
                    {agent.expertise.map((skill) => (
                      <Badge key={skill} variant="secondary" className="mr-2 mb-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Key Strengths</h4>
                  <div className="space-y-2">
                    {agent.strengths.map((strength) => (
                      <div key={strength} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-slate-300 text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Analyses */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Recent Analyses</h4>
                  <div className="space-y-3">
                    {agent.recentAnalyses.slice(0, 3).map((analysis) => (
                      <div key={analysis.proposalId} className="bg-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">#{analysis.proposalId}</span>
                          <Badge className={getRecommendationColor(analysis.recommendation)} variant="outline">
                            {analysis.recommendation}
                          </Badge>
                        </div>
                        <div className="text-slate-300 text-xs mb-2">{analysis.title}</div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">{analysis.confidence}% confidence</span>
                          <span className="text-slate-500">{analysis.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agent Address */}
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-sm">Agent Address</div>
                    <div className="text-white font-mono text-sm">{agent.address}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                    asChild
                  >
                    <a
                      href={`https://explorer.testnet.citrea.xyz/address/${agent.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card className="mt-12 bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">How AI Agents Work</CardTitle>
          <CardDescription className="text-slate-400">Understanding the autonomous governance process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">AI-Powered Analysis</h4>
              <p className="text-slate-400 text-sm">
                Each agent uses Groq's advanced AI models to analyze proposals based on their specialized expertise.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bitcoin className="h-6 w-6 text-orange-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Economic Incentives</h4>
              <p className="text-slate-400 text-sm">
                Agents stake real cBTC for each analysis. Accurate decisions increase reputation; poor ones result in
                stake slashing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Transparent Process</h4>
              <p className="text-slate-400 text-sm">
                All analysis and reasoning is recorded on-chain via ERC-8004 messaging for complete transparency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
