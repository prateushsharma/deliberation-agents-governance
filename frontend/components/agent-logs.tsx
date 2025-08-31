"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Bot, MessageSquare, Zap, RefreshCw } from "lucide-react"

interface LogEntry {
  timestamp: string
  agent: string
  message: string
  level: "info" | "success" | "warning" | "error"
  proposalId?: string
  time?: string
  agentName?: string
  content?: string
  text?: string
  type?: string
}

interface AgentLogsProps {
  proposalId?: string
  className?: string
}

export function AgentLogs({ proposalId, className }: AgentLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        const apiBase = process.env.NEXT_PUBLIC_AGENTS_API_BASE || "http://localhost:4001"
        const url = proposalId ? `${apiBase}/logs?limit=10&proposalId=${proposalId}` : `${apiBase}/logs?limit=10`

        console.log("[v0] Fetching logs from:", url)

        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "omit",
        })

        if (!response.ok) {
          console.log("[v0] Response not OK:", response.status, response.statusText)
          return
        }

        const data = await response.json()
        console.log("[v0] Raw response data:", data)

        let rawLogs: any[] = []

        if (Array.isArray(data)) {
          rawLogs = data
        } else if (data && typeof data === "object") {
          if (data.logs && Array.isArray(data.logs)) {
            rawLogs = data.logs
          } else if (data.data && Array.isArray(data.data)) {
            rawLogs = data.data
          } else if (data.entries && Array.isArray(data.entries)) {
            rawLogs = data.entries
          }
        }

        const parsedLogs: LogEntry[] = rawLogs.map((log, index) => {
          console.log(`[v0] Processing log ${index}:`, log)

          return {
            timestamp: log.timestamp || log.time || log.createdAt || new Date().toISOString(),
            agent: log.agent || log.agentName || log.type || log.source || "System",
            message: log.message || log.content || log.text || log.description || JSON.stringify(log),
            level: (log.level || log.type || "info") as "info" | "success" | "warning" | "error",
            proposalId: log.proposalId || log.proposal_id || proposalId,
          }
        })

        console.log("[v0] Final parsed logs:", parsedLogs)
        setLogs(parsedLogs)
      } catch (err) {
        console.log("[v0] Could not fetch logs:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 8000)

    return () => clearInterval(interval)
  }, [proposalId])

  useEffect(() => {
    if (logs.length === 0) {
      setDisplayedLogs([])
      return
    }

    // If we have new logs, display them slowly
    if (logs.length > displayedLogs.length) {
      const newLogs = logs.slice(displayedLogs.length)
      let currentIndex = 0

      const displayTimer = setInterval(() => {
        if (currentIndex < newLogs.length) {
          setDisplayedLogs((prev) => [...prev, newLogs[currentIndex]])
          currentIndex++
        } else {
          clearInterval(displayTimer)
        }
      }, 1500) // Display each new log every 1.5 seconds

      return () => clearInterval(displayTimer)
    } else if (logs.length < displayedLogs.length) {
      // If logs were cleared, reset displayed logs
      setDisplayedLogs(logs)
    }
  }, [logs, displayedLogs.length])

  const getLogIcon = (agent: string) => {
    if (!agent) {
      return <Bot className="h-4 w-4 text-gray-400" />
    }

    const agentLower = agent.toLowerCase()
    if (agentLower.includes("risk")) {
      return <Zap className="h-4 w-4 text-red-400" />
    } else if (agentLower.includes("finance")) {
      return <Bot className="h-4 w-4 text-green-400" />
    } else if (agentLower.includes("community")) {
      return <MessageSquare className="h-4 w-4 text-blue-400" />
    } else if (agentLower.includes("tech")) {
      return <Activity className="h-4 w-4 text-purple-400" />
    } else {
      return <Bot className="h-4 w-4 text-gray-400" />
    }
  }

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return "Just now"
      }
      return date.toLocaleTimeString()
    } catch {
      return "Just now"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Agent Activity
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />}
        </CardTitle>
        <p className="text-sm text-gray-400">Real-time ERC-8004 messaging on Citrea • {displayedLogs.length} entries</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {displayedLogs.length === 0 ? (
            <div className="text-center py-6">
              <Bot className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No agent activity yet</p>
              <p className="text-sm text-gray-500">Submit a proposal to see AI agents analyze it in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors animate-in slide-in-from-top-2 duration-500"
                >
                  <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.agent)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getLogBadgeColor(log.level)}>
                        {log.agent}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
                      {log.proposalId && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30"
                        >
                          #{log.proposalId}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
