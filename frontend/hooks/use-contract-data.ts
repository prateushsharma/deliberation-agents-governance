"use client"

import { useState, useEffect } from "react"
import { getStakingContract, getConsensusContract, getMessengerContract, formatCBTC } from "@/lib/contracts"

export interface AgentData {
  address: string
  specialization: string
  stake: string
  accuracy: number
  isActive: boolean
}

export interface ProposalAnalysis {
  agent: string
  specialization: string
  recommendation: number
  confidence: number
  reasoning: string
  timestamp: number
}

export interface ConsensusState {
  consensusReached: boolean
  finalDecision: number
  approvalWeight: string
  totalWeight: string
  approvalRate: number
}

export interface MessageThread {
  sender: string
  content: string
  timestamp: number
  messageType: number
}

export function useAgentData(agentAddress: string) {
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAgentData() {
      if (!agentAddress) return

      try {
        setLoading(true)
        const contract = getStakingContract()
        const result = await contract.agents(agentAddress)

        setAgentData({
          address: agentAddress,
          specialization: result.specialization,
          stake: formatCBTC(result.stake),
          accuracy: Number(result.accuracy),
          isActive: result.isActive,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agent data")
      } finally {
        setLoading(false)
      }
    }

    fetchAgentData()
  }, [agentAddress])

  return { agentData, loading, error }
}

export function useProposalAnalyses(proposalId: number) {
  const [analyses, setAnalyses] = useState<ProposalAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyses() {
      if (!proposalId) return

      try {
        setLoading(true)
        const contract = getStakingContract()
        const result = await contract.getProposalAnalyses(proposalId)

        const formattedAnalyses = result.map((analysis: any) => ({
          agent: analysis.agent,
          specialization: analysis.specialization,
          recommendation: Number(analysis.recommendation),
          confidence: Number(analysis.confidence),
          reasoning: analysis.reasoning,
          timestamp: Number(analysis.timestamp),
        }))

        setAnalyses(formattedAnalyses)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analyses")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [proposalId])

  return { analyses, loading, error, refetch: () => fetchAnalyses() }
}

export function useConsensusState(proposalId: number) {
  const [consensusState, setConsensusState] = useState<ConsensusState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConsensusState() {
      if (!proposalId) return

      try {
        setLoading(true)
        const contract = getConsensusContract()
        const result = await contract.getConsensusState(proposalId)

        const approvalWeight = formatCBTC(result.approvalWeight)
        const totalWeight = formatCBTC(result.totalWeight)
        const approvalRate = Number(totalWeight) > 0 ? (Number(approvalWeight) / Number(totalWeight)) * 100 : 0

        setConsensusState({
          consensusReached: result.consensusReached,
          finalDecision: Number(result.finalDecision),
          approvalWeight,
          totalWeight,
          approvalRate,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch consensus state")
      } finally {
        setLoading(false)
      }
    }

    fetchConsensusState()
  }, [proposalId])

  return { consensusState, loading, error, refetch: () => fetchConsensusState() }
}

export function useMessageThread(proposalId: number) {
  const [messages, setMessages] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      if (!proposalId) return

      try {
        setLoading(true)
        const contract = getMessengerContract()
        const result = await contract.getProposalThread(proposalId)

        const formattedMessages = result.map((message: any) => ({
          sender: message.sender,
          content: message.content,
          timestamp: Number(message.timestamp),
          messageType: Number(message.messageType),
        }))

        setMessages(formattedMessages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch messages")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [proposalId])

  return { messages, loading, error, refetch: () => fetchMessages() }
}

export function useContractEvents() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const stakingContract = getStakingContract()
    const consensusContract = getConsensusContract()
    const messengerContract = getMessengerContract()

    // Listen for staking events
    const handleAgentRegistered = (agent: string, specialization: string, stake: bigint) => {
      setEvents((prev) => [
        ...prev,
        {
          type: "AgentRegistered",
          agent,
          specialization,
          stake: formatCBTC(stake),
          timestamp: Date.now(),
        },
      ])
    }

    const handleAnalysisSubmitted = (proposalId: bigint, agent: string, recommendation: number, confidence: number) => {
      setEvents((prev) => [
        ...prev,
        {
          type: "AnalysisSubmitted",
          proposalId: Number(proposalId),
          agent,
          recommendation,
          confidence,
          timestamp: Date.now(),
        },
      ])
    }

    // Listen for consensus events
    const handleConsensusReached = (
      proposalId: bigint,
      finalDecision: number,
      approvalWeight: bigint,
      totalWeight: bigint,
    ) => {
      setEvents((prev) => [
        ...prev,
        {
          type: "ConsensusReached",
          proposalId: Number(proposalId),
          finalDecision,
          approvalWeight: formatCBTC(approvalWeight),
          totalWeight: formatCBTC(totalWeight),
          timestamp: Date.now(),
        },
      ])
    }

    // Listen for message events
    const handleMessagePosted = (proposalId: bigint, sender: string, content: string, messageType: number) => {
      setEvents((prev) => [
        ...prev,
        {
          type: "MessagePosted",
          proposalId: Number(proposalId),
          sender,
          content,
          messageType,
          timestamp: Date.now(),
        },
      ])
    }

    // Set up event listeners
    stakingContract.on("AgentRegistered", handleAgentRegistered)
    stakingContract.on("AnalysisSubmitted", handleAnalysisSubmitted)
    consensusContract.on("ConsensusReached", handleConsensusReached)
    messengerContract.on("MessagePosted", handleMessagePosted)

    return () => {
      // Clean up event listeners
      stakingContract.off("AgentRegistered", handleAgentRegistered)
      stakingContract.off("AnalysisSubmitted", handleAnalysisSubmitted)
      consensusContract.off("ConsensusReached", handleConsensusReached)
      messengerContract.off("MessagePosted", handleMessagePosted)
    }
  }, [])

  return events
}
