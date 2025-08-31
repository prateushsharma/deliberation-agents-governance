"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle, Zap, Brain, MessageSquare } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { getStakingContract, getConsensusContract, getMessengerContract, parseCBTC } from "@/lib/contracts"

export function ContractInteractions() {
  const { signer, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Agent Registration
  const [agentForm, setAgentForm] = useState({
    specialization: "",
    ipfsProfile: "",
    stakeAmount: "0.001",
  })

  // Analysis Submission
  const [analysisForm, setAnalysisForm] = useState({
    proposalId: "",
    recommendation: "1",
    confidence: "85",
    ipfsHash: "",
  })

  // Message Posting
  const [messageForm, setMessageForm] = useState({
    proposalId: "",
    messageType: "1",
    content: "",
  })

  const handleRegisterAgent = async () => {
    if (!signer) return

    try {
      setLoading(true)
      setResult(null)

      const contract = getStakingContract(signer)
      const stakeAmount = parseCBTC(agentForm.stakeAmount)

      const tx = await contract.registerAgent(
        agentForm.specialization,
        agentForm.ipfsProfile || `ipfs://agent-profile-${Date.now()}`,
        { value: stakeAmount },
      )

      await tx.wait()

      setResult({
        type: "success",
        message: `Agent registered successfully! Transaction: ${tx.hash}`,
      })

      // Reset form
      setAgentForm({
        specialization: "",
        ipfsProfile: "",
        stakeAmount: "0.001",
      })
    } catch (error: any) {
      setResult({
        type: "error",
        message: error.message || "Failed to register agent",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnalysis = async () => {
    if (!signer) return

    try {
      setLoading(true)
      setResult(null)

      const contract = getStakingContract(signer)

      const tx = await contract.submitAnalysis(
        Number.parseInt(analysisForm.proposalId),
        Number.parseInt(analysisForm.recommendation),
        Number.parseInt(analysisForm.confidence),
        analysisForm.ipfsHash || `ipfs://analysis-${Date.now()}`,
      )

      await tx.wait()

      setResult({
        type: "success",
        message: `Analysis submitted successfully! Transaction: ${tx.hash}`,
      })

      // Reset form
      setAnalysisForm({
        proposalId: "",
        recommendation: "1",
        confidence: "85",
        ipfsHash: "",
      })
    } catch (error: any) {
      setResult({
        type: "error",
        message: error.message || "Failed to submit analysis",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateConsensus = async (proposalId: string) => {
    if (!signer) return

    try {
      setLoading(true)
      setResult(null)

      const contract = getConsensusContract(signer)
      const tx = await contract.calculateConsensus(Number.parseInt(proposalId))
      await tx.wait()

      setResult({
        type: "success",
        message: `Consensus calculated for proposal ${proposalId}! Transaction: ${tx.hash}`,
      })
    } catch (error: any) {
      setResult({
        type: "error",
        message: error.message || "Failed to calculate consensus",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePostMessage = async () => {
    if (!signer) return

    try {
      setLoading(true)
      setResult(null)

      const contract = getMessengerContract(signer)

      const tx = await contract.postMessage(
        Number.parseInt(messageForm.proposalId),
        Number.parseInt(messageForm.messageType),
        messageForm.content,
      )

      await tx.wait()

      setResult({
        type: "success",
        message: `Message posted successfully! Transaction: ${tx.hash}`,
      })

      // Reset form
      setMessageForm({
        proposalId: "",
        messageType: "1",
        content: "",
      })
    } catch (error: any) {
      setResult({
        type: "error",
        message: error.message || "Failed to post message",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Wallet Not Connected</h3>
          <p className="text-slate-400">Connect your wallet to interact with smart contracts</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Result Alert */}
      {result && (
        <Alert
          className={
            result.type === "success" ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"
          }
        >
          {result.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className={result.type === "success" ? "text-green-300" : "text-red-300"}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="agent" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agent">Register Agent</TabsTrigger>
          <TabsTrigger value="analysis">Submit Analysis</TabsTrigger>
          <TabsTrigger value="consensus">Consensus</TabsTrigger>
          <TabsTrigger value="message">Post Message</TabsTrigger>
        </TabsList>

        {/* Agent Registration */}
        <TabsContent value="agent">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Register AI Agent
              </CardTitle>
              <CardDescription className="text-slate-400">
                Register as an AI agent and stake cBTC to participate in governance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-white">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  value={agentForm.specialization}
                  onChange={(e) => setAgentForm((prev) => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Risk Assessment, Financial Analysis"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipfsProfile" className="text-white">
                  IPFS Profile (Optional)
                </Label>
                <Input
                  id="ipfsProfile"
                  value={agentForm.ipfsProfile}
                  onChange={(e) => setAgentForm((prev) => ({ ...prev, ipfsProfile: e.target.value }))}
                  placeholder="ipfs://..."
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stakeAmount" className="text-white">
                  Stake Amount (cBTC)
                </Label>
                <Input
                  id="stakeAmount"
                  type="number"
                  step="0.001"
                  value={agentForm.stakeAmount}
                  onChange={(e) => setAgentForm((prev) => ({ ...prev, stakeAmount: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <Button
                onClick={handleRegisterAgent}
                disabled={loading || !agentForm.specialization}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Register Agent
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Submission */}
        <TabsContent value="analysis">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                Submit Analysis
              </CardTitle>
              <CardDescription className="text-slate-400">
                Submit your analysis and recommendation for a proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposalId" className="text-white">
                    Proposal ID
                  </Label>
                  <Input
                    id="proposalId"
                    type="number"
                    value={analysisForm.proposalId}
                    onChange={(e) => setAnalysisForm((prev) => ({ ...prev, proposalId: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendation" className="text-white">
                    Recommendation
                  </Label>
                  <select
                    id="recommendation"
                    value={analysisForm.recommendation}
                    onChange={(e) => setAnalysisForm((prev) => ({ ...prev, recommendation: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="1">Approve (1)</option>
                    <option value="0">Neutral (0)</option>
                    <option value="-1">Reject (-1)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence" className="text-white">
                  Confidence (0-100)
                </Label>
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="100"
                  value={analysisForm.confidence}
                  onChange={(e) => setAnalysisForm((prev) => ({ ...prev, confidence: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipfsHash" className="text-white">
                  IPFS Hash (Optional)
                </Label>
                <Input
                  id="ipfsHash"
                  value={analysisForm.ipfsHash}
                  onChange={(e) => setAnalysisForm((prev) => ({ ...prev, ipfsHash: e.target.value }))}
                  placeholder="ipfs://..."
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <Button
                onClick={handleSubmitAnalysis}
                disabled={loading || !analysisForm.proposalId}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Submit Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consensus Calculation */}
        <TabsContent value="consensus">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Calculate Consensus</CardTitle>
              <CardDescription className="text-slate-400">
                Trigger consensus calculation for proposals with completed analyses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((proposalId) => (
                  <div key={proposalId} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Proposal #{proposalId}</div>
                      <div className="text-slate-400 text-sm">Ready for consensus calculation</div>
                    </div>
                    <Button
                      onClick={() => handleCalculateConsensus(proposalId.toString())}
                      disabled={loading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Posting */}
        <TabsContent value="message">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                Post Message
              </CardTitle>
              <CardDescription className="text-slate-400">Post a message to the ERC-8004 audit trail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="msgProposalId" className="text-white">
                    Proposal ID
                  </Label>
                  <Input
                    id="msgProposalId"
                    type="number"
                    value={messageForm.proposalId}
                    onChange={(e) => setMessageForm((prev) => ({ ...prev, proposalId: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messageType" className="text-white">
                    Message Type
                  </Label>
                  <select
                    id="messageType"
                    value={messageForm.messageType}
                    onChange={(e) => setMessageForm((prev) => ({ ...prev, messageType: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="0">General</option>
                    <option value="1">Analysis Posted</option>
                    <option value="2">Consensus Reached</option>
                    <option value="3">Payment Executed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">
                  Message Content
                </Label>
                <textarea
                  id="content"
                  value={messageForm.content}
                  onChange={(e) => setMessageForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your message..."
                  rows={3}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-md px-3 py-2 resize-none"
                />
              </div>

              <Button
                onClick={handlePostMessage}
                disabled={loading || !messageForm.proposalId || !messageForm.content}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Post Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
