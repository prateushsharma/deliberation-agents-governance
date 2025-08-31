"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Bot, MessageSquare, Zap } from "lucide-react"

interface LogEntry {
  timestamp: string
  agent: string
  message: string
  level: "info" | "success" | "warning" | "error"
  proposalId?: string
}

interface AgentLogsProps {
  proposalId?: string
  className?: string
}

export function AgentLogs({ proposalId, className }: AgentLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_AGENTS_API_BASE || "http://localhost:4001"
        const url = proposalId ? `${apiBase}/logs?limit=200&proposalId=${proposalId}` : `${apiBase}/logs?limit=200`

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
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Received logs:", data)

        if (Array.isArray(data)) {
          setLogs(data)
        } else if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs)
        } else {
          console.warn("[v0] Unexpected logs format:", data)
          setLogs([])
        }

        setError(null)
      } catch (err) {
        console.error("[v0] Failed to fetch logs:", err)
        if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
          setError("CORS Error: Cannot connect to localhost from v0 preview. Server needs CORS headers or use a proxy.")
        } else {
          setError(err instanceof Error ? err.message : "Failed to fetch logs")
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchLogs()

    // Poll every 3 seconds for live updates
    const interval = setInterval(fetchLogs, 3000)

    return () => clearInterval(interval)
  }, [proposalId])

  const getLogIcon = (agent: string) => {
    if (!agent) {
      return <Bot className="h-4 w-4 text-gray-400" />
    }

    switch (agent.toLowerCase()) {
      case "riskbot":
        return <Zap className="h-4 w-4 text-red-400" />
      case "financebot":
        return <Bot className="h-4 w-4 text-green-400" />
      case "communitybot":
        return <MessageSquare className="h-4 w-4 text-blue-400" />
      case "techbot":
        return <Activity className="h-4 w-4 text-purple-400" />
      default:
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
      return new Date(timestamp).toLocaleTimeString()
    } catch {
      return timestamp
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Agent Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">Failed to connect to agents server</p>
            <p className="text-sm text-gray-500 mb-2">{error}</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>To fix this issue:</p>
              <p>1. Add CORS headers to your agents server at localhost:4001</p>
              <p>2. Or use a proxy/tunnel service like ngrok</p>
              <p>3. The server is working (Thunder CLI confirms) but needs CORS for browser access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Agent Activity
          {isLoading && <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />}
        </CardTitle>
        <p className="text-sm text-gray-400">Real-time ERC-8004 messaging on Citrea • {logs.length} entries</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No agent activity yet</p>
              <p className="text-sm text-gray-500">Submit a proposal to see AI agents analyze it in real-time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.agent)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getLogBadgeColor(log.level)}>
                        {log.agent || "Unknown Agent"}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
                      {log.proposalId && (
                        <Badge variant="outline" className="text-xs">
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
