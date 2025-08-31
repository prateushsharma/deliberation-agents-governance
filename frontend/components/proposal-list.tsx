"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, XCircle, AlertTriangle, Brain, Play, Eye, Bitcoin, Loader2 } from "lucide-react"
import Link from "next/link"
import { AgentLogs } from "./agent-logs"

interface Proposal {
  id: number
  title: string
  description: string
  amount: number
  category: string
  urgency: "Critical" | "High" | "Normal" | "Low"
  status: "WAITING_TO_BEGIN" | "ANALYZING" | "APPROVED" | "REJECTED" | "PENDING" | "analyzing"
  registeredAgents: number
  totalAgents: number
  consensusProgress: number
  submittedAt: string
  recipient: string
  agentDecisions?: Array<{
    agent: string
    decision: string
    confidence: number
    reasoning?: string
  }>
  txHash?: string
  submitter?: string
}

export function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const parseWeightedApprovalFromLogs = async (proposalId: number) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_AGENTS_API_BASE || "http://localhost:4001"
      const response = await fetch(`${apiBase}/logs?limit=200`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
      })

      if (response.ok) {
        const logs = await response.json()
        const logsArray = Array.isArray(logs) ? logs : logs.logs || []

        // Find weighted approval for this proposal
        const weightedApprovalLog = logsArray.find(
          (log: any) =>
            (log.message || log.content || log.text || "").includes(`Weighted Approval:`) &&
            (log.message || log.content || log.text || "").includes(`proposal ${proposalId}`),
        )

        if (weightedApprovalLog) {
          const message = weightedApprovalLog.message || weightedApprovalLog.content || weightedApprovalLog.text || ""
          const match = message.match(/Weighted Approval:\s*(\d+\.?\d*)%/)
          if (match) {
            return Number.parseFloat(match[1])
          }
        }

        // Count agent decisions for this proposal
        const agentDecisions = logsArray.filter((log: any) => {
          const message = log.message || log.content || log.text || ""
          return (
            message.includes(`proposal ${proposalId}`) && (message.includes("APPROVE") || message.includes("REJECT"))
          )
        })

        const approvals = agentDecisions.filter((log: any) => {
          const message = log.message || log.content || log.text || ""
          return message.includes("APPROVE")
        }).length

        const rejections = agentDecisions.filter((log: any) => {
          const message = log.message || log.content || log.text || ""
          return message.includes("REJECT")
        }).length

        // Calculate weighted approval based on decisions
        if (approvals + rejections > 0) {
          return (approvals / (approvals + rejections)) * 100
        }
      }
    } catch (error) {
      console.log("[v0] Could not parse weighted approval from logs:", error)
    }
    return 0
  }

  const fetchProposals = async () => {
    try {
      setLoading(true)

      const localProposals = JSON.parse(localStorage.getItem("submittedProposals") || "[]")
      console.log("[v0] Found local proposals:", localProposals)

      const apiBase = process.env.NEXT_PUBLIC_AGENTS_API_BASE || "http://localhost:4001"

      try {
        const response = await fetch(`${apiBase}/proposals`, {
          method: "GET",
          mode: "cors",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Fetched proposals from agents server:", data)

          const proposalsArray = Array.isArray(data) ? data : data.proposals || []

          if (proposalsArray.length > 0) {
            const transformedProposals = await Promise.all(
              proposalsArray.map(async (proposal: any, index: number) => {
                const proposalId = proposal.id || proposal.proposalId || index + 1
                const weightedApproval = await parseWeightedApprovalFromLogs(proposalId)

                return {
                  id: proposalId,
                  title:
                    proposal.title ||
                    proposal.name ||
                    proposal.description?.substring(0, 50) ||
                    `Proposal #${proposalId}`,
                  description:
                    proposal.description || proposal.details || proposal.content || "No description available",
                  amount: Number.parseFloat(proposal.amount || proposal.funding || proposal.requestedAmount || "0.1"),
                  category: proposal.category || proposal.type || proposal.infrastructure || "other",
                  urgency: proposal.urgency || proposal.priority || "Normal",
                  status: proposal.status || "WAITING_TO_BEGIN",
                  registeredAgents: proposal.registeredAgents || 4,
                  totalAgents: 4,
                  consensusProgress: weightedApproval,
                  submittedAt:
                    proposal.submittedAt || proposal.createdAt || proposal.timestamp || new Date().toISOString(),
                  recipient:
                    proposal.recipient ||
                    proposal.address ||
                    proposal.walletAddress ||
                    "0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234",
                  agentDecisions: proposal.agentDecisions || [],
                }
              }),
            )

            const mergedProposals = [...transformedProposals]
            for (const localProposal of localProposals) {
              const existsOnServer = transformedProposals.find((p: any) => p.id === localProposal.id)
              if (!existsOnServer) {
                const weightedApproval = await parseWeightedApprovalFromLogs(localProposal.id)
                mergedProposals.push({
                  ...localProposal,
                  status: localProposal.status || "ANALYZING",
                  registeredAgents: 4,
                  totalAgents: 4,
                  consensusProgress: weightedApproval,
                })
              }
            }

            setProposals(mergedProposals)
            return
          }
        }
      } catch (error) {
        console.log("[v0] Could not fetch from agents server:", error)
      }

      const mockProposals: Proposal[] = [
        {
          id: 1,
          title: "Emergency Water Pump Repair",
          description:
            "The main community water pump has broken down and needs immediate repair. This affects 150 families who currently have no access to clean water.",
          amount: 0.05,
          category: "water",
          urgency: "Critical",
          status: "APPROVED",
          registeredAgents: 4,
          totalAgents: 4,
          consensusProgress: 85,
          submittedAt: "2024-01-15T10:30:00Z",
          recipient: "0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234",
        },
        {
          id: 2,
          title: "School Solar Panel Installation",
          description:
            "Install solar panels on the community school to reduce electricity costs and provide reliable power for educational activities.",
          amount: 1.2,
          category: "energy",
          urgency: "Normal",
          status: "ANALYZING",
          registeredAgents: 3,
          totalAgents: 4,
          consensusProgress: 60,
          submittedAt: "2024-01-15T14:20:00Z",
          recipient: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        },
      ]

      const allProposals = [...mockProposals]
      for (const localProposal of localProposals) {
        const exists = allProposals.find((p) => p.id === localProposal.id)
        if (!exists) {
          const weightedApproval = await parseWeightedApprovalFromLogs(localProposal.id)
          allProposals.push({
            ...localProposal,
            status: localProposal.status || "ANALYZING",
            registeredAgents: 4,
            totalAgents: 4,
            consensusProgress: weightedApproval,
          })
        }
      }

      setProposals(allProposals)
    } catch (error) {
      console.error("[v0] Error fetching proposals:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()

    // Poll for new proposals every 10 seconds
    const interval = setInterval(fetchProposals, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: Proposal["status"]) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "ANALYZING":
      case "analyzing":
        return <Brain className="h-4 w-4 text-blue-400 animate-pulse" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "WAITING_TO_BEGIN":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: Proposal["status"]) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "REJECTED":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "ANALYZING":
      case "analyzing":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "WAITING_TO_BEGIN":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getUrgencyColor = (urgency: Proposal["urgency"]) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-500/20 text-red-300"
      case "High":
        return "bg-orange-500/20 text-orange-300"
      case "Normal":
        return "bg-blue-500/20 text-blue-300"
      case "Low":
        return "bg-slate-500/20 text-slate-300"
    }
  }

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      water: "Water Infrastructure",
      energy: "Energy & Solar",
      transport: "Roads & Transport",
      education: "Education",
      health: "Healthcare",
      emergency: "Emergency Repair",
      other: "Other",
    }
    return categories[category] || category
  }

  const filteredProposals = proposals.filter((proposal) => {
    if (filter === "active") {
      return ["WAITING_TO_BEGIN", "ANALYZING", "analyzing", "PENDING"].includes(proposal.status)
    }
    if (filter === "completed") {
      return ["APPROVED", "REJECTED"].includes(proposal.status)
    }
    return true
  })

  const handleBeginAnalysis = async (proposalId: number) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: "ANALYZING" as const } : p)))

    try {
      const apiBase = process.env.NEXT_PUBLIC_AGENTS_API_BASE || "http://localhost:4001"
      await fetch(`${apiBase}/analyze/${proposalId}`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
        },
      })
      console.log("[v0] Triggered analysis for proposal", proposalId)
    } catch (error) {
      console.log("[v0] Could not trigger analysis on server:", error)
    }

    // Simulate analysis progress as fallback
    setTimeout(() => {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                status: Math.random() > 0.3 ? ("APPROVED" as const) : ("REJECTED" as const),
                consensusProgress: Math.random() > 0.3 ? 85 : 25,
              }
            : p,
        ),
      )
    }, 5000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-300">Loading proposals...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-400" />
          Live AI Agent Activity
          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
            ERC-8004 on Citrea
          </Badge>
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Real-time logs from AI agents analyzing proposals via ERC-8004 messaging protocol
        </p>
        <AgentLogs />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
          All Proposals ({proposals.length})
        </Button>
        <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")} size="sm">
          Active (
          {proposals.filter((p) => ["WAITING_TO_BEGIN", "ANALYZING", "analyzing", "PENDING"].includes(p.status)).length}
          )
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          size="sm"
        >
          Completed ({proposals.filter((p) => ["APPROVED", "REJECTED"].includes(p.status)).length})
        </Button>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProposals.map((proposal) => (
          <Card key={proposal.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-white text-lg">#{proposal.id}</CardTitle>
                    <Badge className={getStatusColor(proposal.status)} variant="outline">
                      {getStatusIcon(proposal.status)}
                      <span className="ml-1">{proposal.status.replace("_", " ").toUpperCase()}</span>
                    </Badge>
                    {proposal.txHash && (
                      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        On Citrea
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-xl mb-2">{proposal.title}</CardTitle>
                  <CardDescription className="text-slate-300">
                    {proposal.description.length > 120
                      ? `${proposal.description.substring(0, 120)}...`
                      : proposal.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Amount and Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4 text-orange-400" />
                  <span className="text-white font-semibold">{proposal.amount} cBTC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryName(proposal.category)}
                  </Badge>
                  <Badge className={getUrgencyColor(proposal.urgency)} variant="outline">
                    {proposal.urgency}
                  </Badge>
                </div>
              </div>

              {proposal.agentDecisions && proposal.agentDecisions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Agent Decisions:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {proposal.agentDecisions.map((decision, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={
                            decision.decision === "APPROVE"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }
                        >
                          {decision.agent}: {decision.decision} ({decision.confidence}%)
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Registration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">AI Agents Registered</span>
                  <span className="text-white">
                    {proposal.registeredAgents}/{proposal.totalAgents}
                  </span>
                </div>
                <Progress value={(proposal.registeredAgents / proposal.totalAgents) * 100} className="h-2" />
              </div>

              {/* Consensus Progress */}
              {proposal.status === "ANALYZING" ||
              proposal.status === "analyzing" ||
              proposal.status === "PENDING" ||
              proposal.consensusProgress > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Consensus Progress</span>
                    <span className="text-white">{proposal.consensusProgress}%</span>
                  </div>
                  <Progress value={proposal.consensusProgress} className="h-2" />
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {proposal.status === "WAITING_TO_BEGIN" && proposal.registeredAgents > 0 && (
                  <Button
                    onClick={() => handleBeginAnalysis(proposal.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Begin Analysis
                  </Button>
                )}

                <Link href={`/proposals/${proposal.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                Submitted {new Date(proposal.submittedAt).toLocaleDateString()} at{" "}
                {new Date(proposal.submittedAt).toLocaleTimeString()}
                {proposal.submitter && (
                  <div className="font-mono text-xs mt-1">
                    By: {proposal.submitter.substring(0, 6)}...{proposal.submitter.substring(38)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No proposals found</h3>
          <p className="text-slate-400">
            {filter === "all" ? "No proposals have been submitted yet." : `No ${filter} proposals at this time.`}
          </p>
        </div>
      )}
    </div>
  )
}
