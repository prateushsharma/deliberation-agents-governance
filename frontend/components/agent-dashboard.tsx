"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Brain,
  Shield,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  Bitcoin,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react"

interface AgentStatus {
  name: string
  specialization: string
  status: "ACTIVE" | "ANALYZING" | "IDLE" | "STAKING"
  currentProposal?: number
  accuracy: number
  totalStake: number
  analysesCompleted: number
  lastActivity: string
  currentTask?: string
  confidence?: number
  icon: React.ReactNode
  color: string
}

interface LiveActivity {
  id: string
  agent: string
  action: string
  proposal?: number
  timestamp: string
  status: "success" | "pending" | "error"
}

interface ConsensusData {
  proposalId: number
  title: string
  progress: number
  agentsAnalyzed: number
  totalAgents: number
  approvalRate: number
  status: "ANALYZING" | "APPROVED" | "REJECTED" | "PENDING"
}

export function AgentDashboard() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      name: "RiskBot",
      specialization: "Risk Assessment",
      status: "ANALYZING",
      currentProposal: 2,
      accuracy: 92,
      totalStake: 0.0045,
      analysesCompleted: 23,
      lastActivity: "2 minutes ago",
      currentTask: "Analyzing solar panel installation risks",
      confidence: 78,
      icon: <Shield className="h-5 w-5" />,
      color: "text-red-400",
    },
    {
      name: "FinanceBot",
      specialization: "Financial Analysis",
      status: "ACTIVE",
      accuracy: 88,
      totalStake: 0.0067,
      analysesCompleted: 31,
      lastActivity: "5 minutes ago",
      currentTask: "Evaluating budget proposals",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-blue-400",
    },
    {
      name: "CommunityBot",
      specialization: "Community Impact",
      status: "STAKING",
      currentProposal: 4,
      accuracy: 95,
      totalStake: 0.0089,
      analysesCompleted: 28,
      lastActivity: "1 minute ago",
      currentTask: "Staking for bridge repair proposal",
      icon: <Users className="h-5 w-5" />,
      color: "text-green-400",
    },
    {
      name: "TechBot",
      specialization: "Technical Feasibility",
      status: "IDLE",
      accuracy: 90,
      totalStake: 0.0054,
      analysesCompleted: 26,
      lastActivity: "12 minutes ago",
      icon: <Wrench className="h-5 w-5" />,
      color: "text-yellow-400",
    },
  ])

  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([
    {
      id: "1",
      agent: "CommunityBot",
      action: "Staked 0.002 cBTC for proposal #4",
      proposal: 4,
      timestamp: "1 minute ago",
      status: "success",
    },
    {
      id: "2",
      agent: "RiskBot",
      action: "Analyzing proposal #2 - Solar Panel Installation",
      proposal: 2,
      timestamp: "2 minutes ago",
      status: "pending",
    },
    {
      id: "3",
      agent: "FinanceBot",
      action: "Submitted analysis for proposal #1",
      proposal: 1,
      timestamp: "5 minutes ago",
      status: "success",
    },
    {
      id: "4",
      agent: "TechBot",
      action: "Completed feasibility assessment",
      timestamp: "12 minutes ago",
      status: "success",
    },
    {
      id: "5",
      agent: "RiskBot",
      action: "Posted analysis to ERC-8004 messenger",
      proposal: 1,
      timestamp: "15 minutes ago",
      status: "success",
    },
  ])

  const [consensusData, setConsensusData] = useState<ConsensusData[]>([
    {
      proposalId: 2,
      title: "School Solar Panel Installation",
      progress: 60,
      agentsAnalyzed: 3,
      totalAgents: 4,
      approvalRate: 75,
      status: "ANALYZING",
    },
    {
      proposalId: 4,
      title: "Bridge Safety Repairs",
      progress: 25,
      agentsAnalyzed: 1,
      totalAgents: 4,
      approvalRate: 85,
      status: "ANALYZING",
    },
    {
      proposalId: 1,
      title: "Emergency Water Pump Repair",
      progress: 100,
      agentsAnalyzed: 4,
      totalAgents: 4,
      approvalRate: 85,
      status: "APPROVED",
    },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update agent status randomly
      setAgents((prev) =>
        prev.map((agent) => {
          if (Math.random() > 0.8) {
            const statuses: AgentStatus["status"][] = ["ACTIVE", "ANALYZING", "IDLE", "STAKING"]
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
            return {
              ...agent,
              status: newStatus,
              lastActivity: "Just now",
              confidence: agent.status === "ANALYZING" ? Math.floor(Math.random() * 40) + 60 : agent.confidence,
            }
          }
          return agent
        }),
      )

      // Add new activity occasionally
      if (Math.random() > 0.7) {
        const newActivity: LiveActivity = {
          id: Date.now().toString(),
          agent: agents[Math.floor(Math.random() * agents.length)].name,
          action: "Updated analysis parameters",
          timestamp: "Just now",
          status: "pending",
        }

        setLiveActivities((prev) => [newActivity, ...prev.slice(0, 9)])
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [agents])

  const getStatusIcon = (status: AgentStatus["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "ANALYZING":
        return <Brain className="h-4 w-4 text-blue-400 animate-pulse" />
      case "STAKING":
        return <Bitcoin className="h-4 w-4 text-orange-400" />
      case "IDLE":
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: AgentStatus["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "ANALYZING":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "STAKING":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "IDLE":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const getActivityIcon = (status: LiveActivity["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
    }
  }

  const totalStaked = agents.reduce((sum, agent) => sum + agent.totalStake, 0)
  const avgAccuracy = agents.reduce((sum, agent) => sum + agent.accuracy, 0) / agents.length
  const activeAgents = agents.filter((agent) => agent.status !== "IDLE").length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">AI Agent Dashboard</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto text-balance">
          Real-time monitoring of AI agents analyzing community proposals via ERC-8004 messaging on Citrea. Watch
          autonomous governance in action.
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{activeAgents}/4</div>
                <div className="text-slate-400 text-sm">Active Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bitcoin className="h-8 w-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">{totalStaked.toFixed(4)}</div>
                <div className="text-slate-400 text-sm">Total Staked (cBTC)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{avgAccuracy.toFixed(1)}%</div>
                <div className="text-slate-400 text-sm">Avg Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {agents.reduce((sum, agent) => sum + agent.analysesCompleted, 0)}
                </div>
                <div className="text-slate-400 text-sm">Total Analyses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="consensus">Live Consensus</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* AI Agents Tab */}
        <TabsContent value="agents">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <Card key={agent.name} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={agent.color}>{agent.icon}</div>
                      <div>
                        <CardTitle className="text-white">{agent.name}</CardTitle>
                        <CardDescription className="text-slate-400">{agent.specialization}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)} variant="outline">
                      {getStatusIcon(agent.status)}
                      <span className="ml-1">{agent.status}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current Task */}
                  {agent.currentTask && (
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-slate-400 text-sm mb-1">Current Task:</div>
                      <div className="text-white text-sm">{agent.currentTask}</div>
                      {agent.confidence && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Confidence</span>
                            <span className="text-white">{agent.confidence}%</span>
                          </div>
                          <Progress value={agent.confidence} className="h-1" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-sm">Accuracy</div>
                      <div className="text-white font-semibold">{agent.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Total Stake</div>
                      <div className="text-white font-semibold">{agent.totalStake.toFixed(4)} cBTC</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Analyses</div>
                      <div className="text-white font-semibold">{agent.analysesCompleted}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Last Active</div>
                      <div className="text-white font-semibold">{agent.lastActivity}</div>
                    </div>
                  </div>

                  {/* Current Proposal */}
                  {agent.currentProposal && (
                    <div className="pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Analyzing Proposal #{agent.currentProposal}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-400 text-sm">Live</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Consensus Tab */}
        <TabsContent value="consensus">
          <div className="space-y-6">
            {consensusData.map((consensus) => (
              <Card key={consensus.proposalId} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Proposal #{consensus.proposalId}</CardTitle>
                      <CardDescription className="text-slate-300">{consensus.title}</CardDescription>
                    </div>
                    <Badge
                      className={
                        consensus.status === "APPROVED"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : consensus.status === "REJECTED"
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }
                      variant="outline"
                    >
                      {consensus.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Analysis Progress</span>
                      <span className="text-white">
                        {consensus.agentsAnalyzed}/{consensus.totalAgents} agents
                      </span>
                    </div>
                    <Progress value={consensus.progress} className="h-2" />
                  </div>

                  {/* Approval Rate */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Approval Rate</span>
                      <span className="text-white">{consensus.approvalRate}%</span>
                    </div>
                    <Progress value={consensus.approvalRate} className="h-2" />
                  </div>

                  {/* Status Details */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {Math.floor((consensus.approvalRate / 100) * consensus.agentsAnalyzed)}
                      </div>
                      <div className="text-slate-400 text-xs">Approvals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">
                        {consensus.agentsAnalyzed -
                          Math.floor((consensus.approvalRate / 100) * consensus.agentsAnalyzed)}
                      </div>
                      <div className="text-slate-400 text-xs">Rejections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-400">
                        {consensus.totalAgents - consensus.agentsAnalyzed}
                      </div>
                      <div className="text-slate-400 text-xs">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Feed Tab */}
        <TabsContent value="activity">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Live Activity Feed
              </CardTitle>
              <CardDescription className="text-slate-400">
                Real-time updates from all AI agents via ERC-8004 messaging protocol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="mt-0.5">{getActivityIcon(activity.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{activity.agent}</span>
                        {activity.proposal && (
                          <Badge variant="secondary" className="text-xs">
                            #{activity.proposal}
                          </Badge>
                        )}
                        <span className="text-slate-500 text-xs">{activity.timestamp}</span>
                      </div>
                      <div className="text-slate-300 text-sm">{activity.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Performance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Agent Performance</CardTitle>
                <CardDescription className="text-slate-400">Accuracy and analysis metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={agent.color}>{agent.icon}</div>
                        <span className="text-white text-sm">{agent.name}</span>
                      </div>
                      <span className="text-white text-sm">{agent.accuracy}%</span>
                    </div>
                    <Progress value={agent.accuracy} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stake Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Stake Distribution</CardTitle>
                <CardDescription className="text-slate-400">cBTC staked by each agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={agent.color}>{agent.icon}</div>
                        <span className="text-white text-sm">{agent.name}</span>
                      </div>
                      <span className="text-white text-sm">{agent.totalStake.toFixed(4)} cBTC</span>
                    </div>
                    <Progress value={(agent.totalStake / totalStaked) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Network Status</CardTitle>
                <CardDescription className="text-slate-400">Citrea blockchain connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Network</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Citrea Testnet</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chain ID</span>
                  <span className="text-white">5115</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ERC-8004 Messaging</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Block Height</span>
                  <span className="text-white">2,847,392</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gas Price</span>
                  <span className="text-white">0.1 gwei</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
                <CardDescription className="text-slate-400">Latest blockchain activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Stake Registration</span>
                    <span className="text-green-400">Success</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">0x8f3c...a063</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Analysis Submission</span>
                    <span className="text-green-400">Success</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">0x742d...c234</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Consensus Calculation</span>
                    <span className="text-yellow-400">Pending</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">0x1f98...f984</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
