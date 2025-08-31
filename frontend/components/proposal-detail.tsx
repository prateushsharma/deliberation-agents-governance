"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Bitcoin,
  Calendar,
  User,
  MapPin,
  Brain,
  Shield,
  TrendingUp,
  Users,
  Wrench,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface AgentAnalysis {
  agent: string
  specialization: string
  recommendation: "APPROVE" | "REJECT" | "NEUTRAL"
  confidence: number
  reasoning: string
  timestamp: string
  stakeAmount: number
}

interface ProposalDetailData {
  id: number
  title: string
  description: string
  amount: number
  category: string
  urgency: string
  status: string
  recipient: string
  submittedAt: string
  analyses: AgentAnalysis[]
  consensusProgress: number
  finalDecision?: "APPROVED" | "REJECTED"
}

// Mock data - in real app this would come from smart contracts
const mockProposalData: ProposalDetailData = {
  id: 1,
  title: "Emergency Water Pump Repair",
  description:
    "The main community water pump has broken down and needs immediate repair. This affects 150 families who currently have no access to clean water. Local technician is available and has identified the required parts. The repair is straightforward but urgent as families are currently walking 2km to the nearest water source.",
  amount: 0.05,
  category: "water",
  urgency: "Critical",
  status: "APPROVED",
  recipient: "0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234",
  submittedAt: "2024-01-15T10:30:00Z",
  consensusProgress: 85,
  finalDecision: "APPROVED",
  analyses: [
    {
      agent: "RiskBot",
      specialization: "Risk Assessment",
      recommendation: "APPROVE",
      confidence: 90,
      reasoning:
        "Emergency water infrastructure repair presents minimal risk. Technical solution is well-defined, local expertise available, and immediate community need is critical. Risk of project failure is very low given straightforward nature of pump repair.",
      timestamp: "2024-01-15T10:32:15Z",
      stakeAmount: 0.001,
    },
    {
      agent: "FinanceBot",
      specialization: "Financial Analysis",
      recommendation: "APPROVE",
      confidence: 85,
      reasoning:
        "Budget of 0.05 cBTC is reasonable for emergency water pump repair. Cost analysis shows good value - affects 150 families, preventing health risks and 2km daily water collection trips. ROI is excellent for community welfare.",
      timestamp: "2024-01-15T10:33:42Z",
      stakeAmount: 0.0015,
    },
    {
      agent: "CommunityBot",
      specialization: "Community Impact",
      recommendation: "APPROVE",
      confidence: 95,
      reasoning:
        "Extremely high community impact. 150 families currently without clean water access, forcing dangerous 2km walks daily. This repair directly addresses basic human need and will immediately improve quality of life for significant portion of community.",
      timestamp: "2024-01-15T10:34:18Z",
      stakeAmount: 0.002,
    },
    {
      agent: "TechBot",
      specialization: "Technical Feasibility",
      recommendation: "APPROVE",
      confidence: 88,
      reasoning:
        "High technical feasibility. Water pump repair is straightforward mechanical work. Local technician has identified specific parts needed and repair methodology. Timeline is realistic and technical complexity is low.",
      timestamp: "2024-01-15T10:35:03Z",
      stakeAmount: 0.0012,
    },
  ],
}

interface Props {
  proposalId: number
}

export function ProposalDetail({ proposalId }: Props) {
  const [proposal, setProposal] = useState<ProposalDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading from smart contracts
    setTimeout(() => {
      setProposal(mockProposalData)
      setLoading(false)
    }, 1000)
  }, [proposalId])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Proposal Not Found</h1>
        <p className="text-slate-400 mb-6">The proposal you're looking for doesn't exist.</p>
        <Link href="/proposals">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </Link>
      </div>
    )
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "APPROVE":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "REJECT":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

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

  const getAgentIcon = (specialization: string) => {
    switch (specialization) {
      case "Risk Assessment":
        return <Shield className="h-5 w-5 text-red-400" />
      case "Financial Analysis":
        return <TrendingUp className="h-5 w-5 text-blue-400" />
      case "Community Impact":
        return <Users className="h-5 w-5 text-green-400" />
      case "Technical Feasibility":
        return <Wrench className="h-5 w-5 text-yellow-400" />
      default:
        return <Brain className="h-5 w-5 text-purple-400" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/proposals">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-white">Proposal #{proposal.id}</h1>
          <Badge
            className={
              proposal.finalDecision === "APPROVED"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-blue-500/20 text-blue-300 border-blue-500/30"
            }
            variant="outline"
          >
            {proposal.finalDecision || proposal.status}
          </Badge>
        </div>
        <h2 className="text-2xl text-white mb-4">{proposal.title}</h2>
        <p className="text-slate-300 text-lg leading-relaxed">{proposal.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Agent Analyses */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                AI Agent Analyses
              </CardTitle>
              <CardDescription className="text-slate-400">
                Real-time analysis from specialized AI agents with economic stakes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {proposal.analyses.map((analysis, index) => (
                <div key={index} className="border border-slate-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getAgentIcon(analysis.specialization)}
                      <div>
                        <h4 className="text-white font-semibold">{analysis.agent}</h4>
                        <p className="text-slate-400 text-sm">{analysis.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getRecommendationColor(analysis.recommendation)} variant="outline">
                        {getRecommendationIcon(analysis.recommendation)}
                        <span className="ml-1">{analysis.recommendation}</span>
                      </Badge>
                      <div className="text-slate-400 text-sm mt-1">{analysis.confidence}% confidence</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-white font-medium mb-2">Analysis Reasoning:</h5>
                    <p className="text-slate-300 text-sm leading-relaxed">{analysis.reasoning}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Stake: {analysis.stakeAmount} cBTC</span>
                    <span>{new Date(analysis.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Consensus Results */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Consensus Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Overall Consensus</span>
                  <span className="text-white font-semibold">{proposal.consensusProgress}%</span>
                </div>
                <Progress value={proposal.consensusProgress} className="h-3" />

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">
                      {proposal.analyses.filter((a) => a.recommendation === "APPROVE").length}
                    </div>
                    <div className="text-green-300 text-sm">Approvals</div>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="text-2xl font-bold text-red-400">
                      {proposal.analyses.filter((a) => a.recommendation === "REJECT").length}
                    </div>
                    <div className="text-red-300 text-sm">Rejections</div>
                  </div>
                </div>

                {proposal.finalDecision && (
                  <div
                    className={`mt-6 p-4 rounded-lg border ${
                      proposal.finalDecision === "APPROVED"
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {proposal.finalDecision === "APPROVED" ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span
                        className={`font-semibold ${
                          proposal.finalDecision === "APPROVED" ? "text-green-300" : "text-red-300"
                        }`}
                      >
                        Proposal {proposal.finalDecision}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      {proposal.finalDecision === "APPROVED"
                        ? "Automatic cBTC payment has been executed to the recipient address."
                        : "Proposal did not meet consensus threshold for approval."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Proposal Details */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Proposal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Bitcoin className="h-5 w-5 text-orange-400" />
                <div>
                  <div className="text-slate-400 text-sm">Amount Requested</div>
                  <div className="text-white font-semibold">{proposal.amount} cBTC</div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-slate-400 text-sm">Submitted</div>
                  <div className="text-white">{new Date(proposal.submittedAt).toLocaleDateString()}</div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-slate-400 text-sm">Recipient</div>
                  <div className="text-white font-mono text-xs break-all">{proposal.recipient}</div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-slate-400 text-sm">Category</div>
                  <div className="text-white">Water Infrastructure</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Blockchain Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Network</span>
                <span className="text-white">Citrea Testnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Chain ID</span>
                <span className="text-white">5115</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Stakes</span>
                <span className="text-white">
                  {proposal.analyses.reduce((sum, a) => sum + a.stakeAmount, 0).toFixed(4)} cBTC
                </span>
              </div>

              <Separator className="bg-slate-700" />

              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                asChild
              >
                <a href="https://explorer.testnet.citrea.xyz" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* ERC-8004 Audit Trail */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                Audit Trail
              </CardTitle>
              <CardDescription className="text-slate-400">Complete transparency via ERC-8004 messaging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proposal.analyses.map((analysis, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white font-medium">{analysis.agent}</span>
                      <span className="text-slate-500">{new Date(analysis.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-400 ml-4">Submitted {analysis.recommendation} analysis</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
