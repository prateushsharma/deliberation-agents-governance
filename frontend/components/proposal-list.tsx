"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, XCircle, AlertTriangle, Brain, Play, Eye, Bitcoin } from "lucide-react"
import Link from "next/link"

interface Proposal {
  id: number
  title: string
  description: string
  amount: number
  category: string
  urgency: "Critical" | "High" | "Normal" | "Low"
  status: "WAITING_TO_BEGIN" | "ANALYZING" | "APPROVED" | "REJECTED" | "PENDING"
  registeredAgents: number
  totalAgents: number
  consensusProgress: number
  submittedAt: string
  recipient: string
}

// Mock data - in real app this would come from smart contracts
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
  {
    id: 3,
    title: "Community Garden Tools",
    description:
      "Purchase basic gardening tools and materials for our community garden. Will benefit 50 families who grow their own food.",
    amount: 0.08,
    category: "other",
    urgency: "Low",
    status: "WAITING_TO_BEGIN",
    registeredAgents: 2,
    totalAgents: 4,
    consensusProgress: 0,
    submittedAt: "2024-01-15T16:45:00Z",
    recipient: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  {
    id: 4,
    title: "Bridge Safety Repairs",
    description: "Critical safety repairs needed for the main bridge connecting our community to the market town.",
    amount: 0.8,
    category: "transport",
    urgency: "High",
    status: "PENDING",
    registeredAgents: 4,
    totalAgents: 4,
    consensusProgress: 45,
    submittedAt: "2024-01-15T09:15:00Z",
    recipient: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
]

export function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const getStatusIcon = (status: Proposal["status"]) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "ANALYZING":
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
      return ["WAITING_TO_BEGIN", "ANALYZING", "PENDING"].includes(proposal.status)
    }
    if (filter === "completed") {
      return ["APPROVED", "REJECTED"].includes(proposal.status)
    }
    return true
  })

  const handleBeginAnalysis = (proposalId: number) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: "ANALYZING" as const } : p)))

    // Simulate analysis progress
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

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
          All Proposals ({proposals.length})
        </Button>
        <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")} size="sm">
          Active ({proposals.filter((p) => ["WAITING_TO_BEGIN", "ANALYZING", "PENDING"].includes(p.status)).length})
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
                      <span className="ml-1">{proposal.status.replace("_", " ")}</span>
                    </Badge>
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
              {proposal.status === "ANALYZING" || proposal.status === "PENDING" || proposal.consensusProgress > 0 ? (
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
