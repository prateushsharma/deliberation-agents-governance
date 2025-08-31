"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LogEntry {
  level: "info" | "warn" | "error"
  text: string
  timestamp: string
  proposalId?: number
}

interface LogsStreamProps {
  proposalId?: number
  className?: string
}

export default function LogsStream({ proposalId, className }: LogsStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_AGENTS_API_BASE || "http://localhost:4001"
    const es = new EventSource(`${base}/events`)

    es.onopen = () => {
      setIsConnected(true)
      setLogs((prev) => [
        ...prev,
        {
          level: "info",
          text: "🔌 Connected to AI Agents Server - ERC-8004 messaging active",
          timestamp: new Date().toISOString(),
        },
      ])
    }

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        const logEntry: LogEntry = {
          level: data.level || "info",
          text: data.text || ev.data,
          timestamp: new Date().toISOString(),
          proposalId: data.proposalId,
        }

        // Filter by proposalId if specified
        if (!proposalId || !data.proposalId || data.proposalId === proposalId) {
          setLogs((prev) => [...prev.slice(-99), logEntry])
        }
      } catch {
        setLogs((prev) => [
          ...prev.slice(-99),
          {
            level: "info",
            text: ev.data,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    }

    es.onerror = () => {
      setIsConnected(false)
      setLogs((prev) => [
        ...prev.slice(-99),
        {
          level: "error",
          text: "🔌 Disconnected from agents server",
          timestamp: new Date().toISOString(),
        },
      ])
    }

    return () => es.close()
  }, [proposalId])

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return "❌"
      case "warn":
        return "⚠️"
      default:
        return "ℹ️"
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      default:
        return "text-blue-400"
    }
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">
            {proposalId ? `Proposal #${proposalId} Agent Logs` : "Live Agent Activity"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </Badge>
            <Badge variant="outline" className="text-xs text-slate-400">
              ERC-8004
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-8">Waiting for agent activity...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-lg leading-none">{getLogIcon(log.level)}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`${getLogColor(log.level)} break-words`}>{log.text}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
