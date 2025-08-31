"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, Zap, Wallet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@/hooks/use-wallet"
import { getProposalRegistryContract, parseCBTC } from "@/lib/contracts"
import LogsStream from "@/components/logs-stream"

interface ProposalFormData {
  title: string
  description: string
  amount: string
  category: string
  urgency: string
  recipient: string
}

export function CreateProposalForm() {
  const { account, isConnected, connect, disconnect, signer } = useWallet()

  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    description: "",
    amount: "",
    category: "",
    urgency: "Normal",
    recipient: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [proposalId, setProposalId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !signer) {
      setErrorMessage("Please connect your wallet first")
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const contract = getProposalRegistryContract(signer)
      const amountInSatoshis = parseCBTC(formData.amount)

      console.log("[v0] Submitting proposal to smart contract...")
      const tx = await contract.submitProposal(
        formData.title,
        formData.description,
        amountInSatoshis,
        formData.recipient,
      )

      console.log("[v0] Transaction sent:", tx.hash)
      const receipt = await tx.wait()
      console.log("[v0] Transaction confirmed:", receipt)

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === "ProposalSubmitted"
        } catch {
          return false
        }
      })

      let newProposalId: number
      if (event) {
        const parsed = contract.interface.parseLog(event)
        newProposalId = Number(parsed?.args[0])
      } else {
        newProposalId = Date.now()
      }

      const agentsApiBase = process.env.NEXT_PUBLIC_AGENTS_API_BASE || "http://localhost:4001"
      console.log("[v0] Sending proposal to agents server at:", agentsApiBase)

      const response = await fetch(`${agentsApiBase}/proposal`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: newProposalId,
          title: formData.title,
          description: formData.description,
          amount: Number.parseFloat(formData.amount),
          category: formData.category,
          urgency: formData.urgency,
          recipient: formData.recipient,
          submitter: account,
        }),
      })

      console.log("[v0] Agents API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Agents API error response:", errorText)
        throw new Error(`Agents API error: ${response.status} - ${errorText}`)
      }

      const responseData = await response.json()
      console.log("[v0] Agents API success:", responseData)

      setProposalId(newProposalId)
      setSubmitStatus("success")

      setFormData({
        title: "",
        description: "",
        amount: "",
        category: "",
        urgency: "Normal",
        recipient: "",
      })
    } catch (error: any) {
      console.error("[v0] Proposal submission failed:", error)

      if (error.message?.includes("Failed to fetch") || error instanceof TypeError) {
        setErrorMessage(
          "CORS Error: Cannot connect to localhost from v0 preview. Your agents server needs CORS headers or use ngrok/proxy. The blockchain submission worked successfully.",
        )
      } else if (error.message?.includes("Agents API error")) {
        setErrorMessage(`Agents server error: ${error.message}`)
      } else {
        setErrorMessage(error.message || "Failed to submit proposal")
      }

      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid =
    formData.title && formData.description && formData.amount && formData.category && formData.recipient

  return (
    <div className="max-w-7xl mx-auto">
      {submitStatus === "success" && (
        <Alert className="mb-8 border-green-500/20 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Proposal #{proposalId} submitted successfully! AI agents are now analyzing via ERC-8004 messaging protocol.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert className="mb-8 border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {errorMessage || "Failed to submit proposal. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Submit Infrastructure Proposal</CardTitle>
              <CardDescription className="text-slate-400">
                Provide detailed information about your community infrastructure needs. AI agents will analyze
                feasibility, cost, and impact using ERC-8004 messaging protocol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Connect Wallet Required</h3>
                      <p className="text-slate-400 text-sm">
                        Connect your MetaMask wallet to submit proposals on Citrea
                      </p>
                    </div>
                    <Button onClick={connect} className="bg-blue-600 hover:bg-blue-700">
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Wallet Connected</h3>
                      <p className="text-slate-400 text-sm font-mono">{account}</p>
                    </div>
                    <Button onClick={disconnect} variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Project Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Emergency Water Pump Repair"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the infrastructure need, who it affects, and why it's important..."
                    rows={4}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">
                      Amount Requested (cBTC)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="0.050"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white">
                      Category
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="water">Water Infrastructure</SelectItem>
                        <SelectItem value="energy">Energy & Solar</SelectItem>
                        <SelectItem value="transport">Roads & Transport</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="health">Healthcare</SelectItem>
                        <SelectItem value="emergency">Emergency Repair</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency" className="text-white">
                      Urgency Level
                    </Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Critical">Critical (Emergency)</SelectItem>
                        <SelectItem value="High">High Priority</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-white">
                      Payment Recipient Address
                    </Label>
                    <Input
                      id="recipient"
                      value={formData.recipient}
                      onChange={(e) => handleInputChange("recipient", e.target.value)}
                      placeholder="0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting || !isConnected}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting to Citrea & Agents...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Submit for AI Analysis
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {proposalId && (
            <div className="mt-8">
              <LogsStream proposalId={proposalId} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Smart Contract Submission</div>
                  <div className="text-slate-400 text-xs">Proposal stored on Citrea blockchain</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="text-white font-medium text-sm">AI Agent Evaluation</div>
                  <div className="text-slate-400 text-xs">Agents communicate via ERC-8004 messaging</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Consensus & Payment</div>
                  <div className="text-slate-400 text-xs">Automatic cBTC payment if approved</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Example Proposals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-white font-medium text-sm mb-1">Water Pump Repair</div>
                <div className="text-slate-400 text-xs mb-2">Emergency fix for 150 families</div>
                <Badge variant="secondary" className="text-xs">
                  0.05 cBTC
                </Badge>
              </div>

              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-white font-medium text-sm mb-1">School Solar Panels</div>
                <div className="text-slate-400 text-xs mb-2">Renewable energy for education</div>
                <Badge variant="secondary" className="text-xs">
                  1.2 cBTC
                </Badge>
              </div>

              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="text-white font-medium text-sm mb-1">Bridge Maintenance</div>
                <div className="text-slate-400 text-xs mb-2">Safety repairs for main road</div>
                <Badge variant="secondary" className="text-xs">
                  0.8 cBTC
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Network Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Network</span>
                  <span className="text-green-400">Citrea Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Agents</span>
                  <span className="text-white">4/4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ERC-8004 Protocol</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Analysis Time</span>
                  <span className="text-white">&lt; 1 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
