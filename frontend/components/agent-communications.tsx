"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Brain, TrendingUp, Users, Wrench, Clock, ArrowRight, Zap, Network } from "lucide-react"

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: Date
  messageType: "analysis" | "consensus" | "query" | "response"
  proposalId?: string
  priority: "low" | "medium" | "high"
}

const agentIcons = {
  RiskBot: Brain,
  FinanceBot: TrendingUp,
  CommunityBot: Users,
  TechBot: Wrench,
}

const agentColors = {
  RiskBot: "text-red-400",
  FinanceBot: "text-green-400",
  CommunityBot: "text-blue-400",
  TechBot: "text-purple-400",
}

export function AgentCommunications() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)

  // Simulate real-time messages
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: "1",
        from: "RiskBot",
        to: "FinanceBot",
        content:
          "Analyzing water pump proposal #WP-2024-001. Initial risk assessment shows moderate infrastructure risk due to remote location. Requesting financial viability analysis.",
        timestamp: new Date(Date.now() - 300000),
        messageType: "query",
        proposalId: "WP-2024-001",
        priority: "high",
      },
      {
        id: "2",
        from: "FinanceBot",
        to: "RiskBot",
        content:
          "Financial analysis complete. Cost-benefit ratio: 3.2:1 over 10 years. ROI positive at 18 months. Budget allocation within acceptable parameters. Proceeding with community impact assessment.",
        timestamp: new Date(Date.now() - 240000),
        messageType: "response",
        proposalId: "WP-2024-001",
        priority: "high",
      },
      {
        id: "3",
        from: "CommunityBot",
        to: "TechBot",
        content:
          "Community impact analysis shows 847 residents affected positively. Water access improvement: 340%. Requesting technical feasibility confirmation for proposed pump specifications.",
        timestamp: new Date(Date.now() - 180000),
        messageType: "query",
        proposalId: "WP-2024-001",
        priority: "medium",
      },
      {
        id: "4",
        from: "TechBot",
        to: "CommunityBot",
        content:
          "Technical feasibility confirmed. Solar-powered pump system compatible with local infrastructure. Maintenance requirements: quarterly. Expected lifespan: 15+ years. All systems green.",
        timestamp: new Date(Date.now() - 120000),
        messageType: "response",
        proposalId: "WP-2024-001",
        priority: "medium",
      },
      {
        id: "5",
        from: "RiskBot",
        to: "ALL_AGENTS",
        content:
          "Consensus building initiated for proposal WP-2024-001. All agents report positive analysis. Staking 0.05 cBTC for APPROVE vote. Confidence level: 87%.",
        timestamp: new Date(Date.now() - 60000),
        messageType: "consensus",
        proposalId: "WP-2024-001",
        priority: "high",
      },
    ]

    setMessages(sampleMessages)

    // Simulate new messages
    const interval = setInterval(() => {
      if (isLive) {
        const newMessage: Message = {
          id: Date.now().toString(),
          from: ["RiskBot", "FinanceBot", "CommunityBot", "TechBot"][Math.floor(Math.random() * 4)],
          to: ["RiskBot", "FinanceBot", "CommunityBot", "TechBot"][Math.floor(Math.random() * 4)],
          content: "Real-time analysis update: Processing new proposal data...",
          timestamp: new Date(),
          messageType: ["analysis", "consensus", "query", "response"][Math.floor(Math.random() * 4)] as any,
          priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
        }

        setMessages((prev) => [newMessage, ...prev].slice(0, 50))
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [isLive])

  const filteredMessages = selectedAgent
    ? messages.filter((m) => m.from === selectedAgent || m.to === selectedAgent || m.to === "ALL_AGENTS")
    : messages

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "analysis":
        return "bg-blue-500/20 text-blue-300"
      case "consensus":
        return "bg-green-500/20 text-green-300"
      case "query":
        return "bg-yellow-500/20 text-yellow-300"
      case "response":
        return "bg-purple-500/20 text-purple-300"
      default:
        return "bg-slate-500/20 text-slate-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-slate-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Network className="h-5 w-5 text-blue-400" />
            ERC8004 Message Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Button
                variant={isLive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLive ? "Live" : "Paused"}
              </Button>
              {isLive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-300">Real-time updates</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={selectedAgent === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAgent(null)}
              >
                All Agents
              </Button>
              {Object.keys(agentIcons).map((agent) => {
                const Icon = agentIcons[agent as keyof typeof agentIcons]
                return (
                  <Button
                    key={agent}
                    variant={selectedAgent === agent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAgent(agent)}
                    className="flex items-center gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    {agent}
                  </Button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Feed */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Agent Message Feed
            <Badge variant="secondary" className="ml-auto">
              {filteredMessages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredMessages.map((message) => {
                const FromIcon = agentIcons[message.from as keyof typeof agentIcons]
                const ToIcon = agentIcons[message.to as keyof typeof agentIcons]

                return (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg bg-slate-700/50 border-l-4 ${getPriorityColor(message.priority)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {FromIcon && (
                            <FromIcon className={`h-4 w-4 ${agentColors[message.from as keyof typeof agentColors]}`} />
                          )}
                          <span className={`font-medium ${agentColors[message.from as keyof typeof agentColors]}`}>
                            {message.from}
                          </span>
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-400" />

                        <div className="flex items-center gap-2">
                          {message.to === "ALL_AGENTS" ? (
                            <>
                              <Network className="h-4 w-4 text-slate-300" />
                              <span className="font-medium text-slate-300">ALL_AGENTS</span>
                            </>
                          ) : (
                            <>
                              {ToIcon && (
                                <ToIcon className={`h-4 w-4 ${agentColors[message.to as keyof typeof agentColors]}`} />
                              )}
                              <span className={`font-medium ${agentColors[message.to as keyof typeof agentColors]}`}>
                                {message.to}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getMessageTypeColor(message.messageType)}>{message.messageType}</Badge>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Clock className="h-3 w-3" />
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{message.content}</p>

                    {message.proposalId && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <Badge variant="outline" className="text-blue-300 border-blue-500">
                          Proposal: {message.proposalId}
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Total Messages</p>
                <p className="text-2xl font-bold text-white">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">High Priority</p>
                <p className="text-2xl font-bold text-white">{messages.filter((m) => m.priority === "high").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Consensus Msgs</p>
                <p className="text-2xl font-bold text-white">
                  {messages.filter((m) => m.messageType === "consensus").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
