import { ethers } from "ethers"
import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

// Contract ABIs
const AI_AGENT_STAKING_ABI = [
  "function registerAgent(string specialization, string ipfsProfile) external payable",
  "function registerForProposal(uint256 proposalId, string specialization) external payable",
  "function submitAnalysis(uint256 proposalId, int8 recommendation, uint8 confidence, string ipfsHash) external",
  "function getProposalAnalyses(uint256 proposalId) external view returns (tuple(address agent, string specialization, int8 recommendation, uint8 confidence, string reasoning, uint256 timestamp)[])",
  "function getProposalAgents(uint256 proposalId) external view returns (address[] agents)",
  "function agents(address) external view returns (string specialization, uint256 stake, uint256 accuracy, bool isActive)",
]

const CONSENSUS_ENGINE_ABI = [
  "function calculateConsensus(uint256 proposalId) external",
  "function getConsensusState(uint256 proposalId) external view returns (bool consensusReached, int8 finalDecision, uint256 approvalWeight, uint256 totalWeight)",
]

const ERC8004_MESSENGER_ABI = [
  "function postMessage(uint256 proposalId, uint8 messageType, string content) external",
  "function getProposalThread(uint256 proposalId) external view returns (tuple(address sender, string content, uint256 timestamp, uint8 messageType)[])",
]

// Your deployed contract addresses
const CONTRACT_ADDRESSES = {
  AI_AGENT_STAKING: "0xaC855951321913A8dBBb7631A5DbcbcE2366570C",
  CONSENSUS_ENGINE: "0xd5D80311b62e32A7D519636796cEFB1C37757362",
  ERC8004_MESSENGER: "0x7A26B68b9DFBeb0284076F4fC959e01044a21DCa",
}

// Citrea Network Configuration
const CITREA_CONFIG = {
  rpcUrl: "https://rpc.testnet.citrea.xyz",
  chainId: 5115,
  name: "Citrea Testnet",
}

class AIAgent {
  constructor(name, specialization, privateKey, stakeAmount) {
    this.name = name
    this.specialization = specialization
    this.stakeAmount = ethers.parseUnits(stakeAmount.toString(), 8) // cBTC has 8 decimals
    this.registeredProposals = new Set() // Track which proposals this agent registered for

    // Setup blockchain connection
    this.provider = new ethers.JsonRpcProvider(CITREA_CONFIG.rpcUrl)
    this.wallet = new ethers.Wallet(privateKey, this.provider)

    // Setup contracts
    this.stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.AI_AGENT_STAKING, AI_AGENT_STAKING_ABI, this.wallet)

    this.messengerContract = new ethers.Contract(
      CONTRACT_ADDRESSES.ERC8004_MESSENGER,
      ERC8004_MESSENGER_ABI,
      this.wallet,
    )

    // Setup Groq AI
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  }

  // STEP 1: Agent decides if it wants to participate in a proposal
  async evaluateProposalRelevance(proposalData) {
    console.log(`🤔 ${this.name} evaluating relevance for: "${proposalData.title}"`)

    const relevanceScore = await this.getRelevanceScore(proposalData)
    const shouldRegister = relevanceScore > 6 // Only register if relevant enough

    console.log(`   📊 Relevance Score: ${relevanceScore}/10 - ${shouldRegister ? "WILL REGISTER" : "SKIPPING"}`)
    return shouldRegister
  }

  async getRelevanceScore(proposalData) {
    // Use AI to determine if this agent should participate
    const prompt = this.buildRelevancePrompt(proposalData)

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a ${this.specialization} AI agent deciding whether to participate in proposal analysis.
            Rate relevance 1-10 (1=not relevant, 10=highly relevant to your specialization).
            Respond only with a number 1-10.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.2,
        max_tokens: 10,
      })

      const score = Number.parseInt(completion.choices[0].message.content.trim())
      return isNaN(score) ? this.getFallbackRelevanceScore(proposalData) : Math.max(1, Math.min(10, score))
    } catch (error) {
      console.log(`⚠️ AI relevance check failed for ${this.name}, using fallback`)
      return this.getFallbackRelevanceScore(proposalData)
    }
  }

  buildRelevancePrompt(proposalData) {
    return `
PROPOSAL RELEVANCE ASSESSMENT

Title: ${proposalData.title}
Description: ${proposalData.description}
Amount: ${proposalData.amount} cBTC
Category: ${proposalData.category || "General"}

My Specialization: ${this.specialization}

Rate how relevant this proposal is to my expertise (1-10):
- Is this proposal something I should analyze?
- Does it match my specialization area?
- Would my analysis add value?
`
  }

  getFallbackRelevanceScore(proposalData) {
    // Simple rule-based fallback if Groq fails
    const title = proposalData.title.toLowerCase()
    const description = proposalData.description.toLowerCase()
    const amount = Number.parseFloat(proposalData.amount)

    switch (this.specialization) {
      case "Risk Assessment":
        // Always relevant - risk is universal
        return 8

      case "Financial Analysis":
        // More relevant for expensive projects
        if (amount > 1.0) return 9
        if (amount > 0.5) return 7
        return 5

      case "Community Impact":
        // Relevant for community-focused projects
        if (
          title.includes("community") ||
          title.includes("public") ||
          title.includes("school") ||
          title.includes("health") ||
          title.includes("water") ||
          title.includes("education")
        )
          return 9
        return 6

      case "Technical Feasibility":
        // Relevant for construction/technical projects
        if (
          title.includes("build") ||
          title.includes("construct") ||
          title.includes("install") ||
          title.includes("technical") ||
          title.includes("system") ||
          title.includes("infrastructure")
        )
          return 9
        if (title.includes("repair") || title.includes("fix")) return 7
        return 4

      default:
        return 5
    }
  }

  // STEP 2: Register for specific proposal (stake cBTC)
  async registerForProposal(proposalId, proposalData) {
    if (this.registeredProposals.has(proposalId)) {
      console.log(`✅ ${this.name} already registered for proposal ${proposalId}`)
      return true
    }

    try {
      console.log(`📝 ${this.name} registering for proposal ${proposalId}...`)

      // Register and stake for this specific proposal
      const tx = await this.stakingContract.registerForProposal(proposalId, this.specialization, {
        value: this.stakeAmount,
      })

      await tx.wait()
      this.registeredProposals.add(proposalId)

      console.log(`✅ ${this.name} registered for proposal ${proposalId}! Tx: ${tx.hash}`)
      return true
    } catch (error) {
      console.error(`❌ Registration failed for ${this.name} on proposal ${proposalId}:`, error.message)
      // Try fallback registration (might be using old contract)
      return await this.fallbackRegistration(proposalId)
    }
  }

  async fallbackRegistration(proposalId) {
    try {
      console.log(`🔄 ${this.name} trying fallback registration...`)
      // Fallback: just register as general agent (for demo with existing contracts)
      const tx = await this.stakingContract.registerAgent(
        this.specialization,
        `ipfs://agent-profile-${this.name}-${proposalId}`,
        { value: this.stakeAmount },
      )

      await tx.wait()
      this.registeredProposals.add(proposalId)
      console.log(`✅ ${this.name} registered (fallback) for proposal ${proposalId}`)
      return true
    } catch (error) {
      console.error(`❌ Fallback registration also failed:`, error.message)
      return false
    }
  }

  // STEP 3: Analyze proposal using real AI (triggered by "Begin Analysis")
  async analyzeProposal(proposalData) {
    console.log(`🔍 ${this.name} analyzing proposal: "${proposalData.title}"`)

    try {
      // Get AI analysis from Groq
      const analysis = await this.getGroqAnalysis(proposalData)

      // Post analysis message to ERC-8004
      await this.postAnalysisMessage(proposalData.id, analysis.reasoning)

      // Submit analysis to staking contract
      await this.submitAnalysis(proposalData.id, analysis)

      return analysis
    } catch (error) {
      console.error(`❌ Analysis failed for ${this.name}:`, error.message)
      return null
    }
  }

  async getGroqAnalysis(proposalData) {
    const prompt = this.buildAnalysisPrompt(proposalData)

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a ${this.specialization} AI agent analyzing community infrastructure proposals. 
            You must provide a recommendation (-1 for reject, 0 for neutral, 1 for approve), 
            confidence score (0-100), and detailed reasoning.
            Respond only with valid JSON in this format:
            {
              "recommendation": -1 | 0 | 1,
              "confidence": 0-100,
              "reasoning": "detailed analysis explaining your decision"
            }`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.3,
        max_tokens: 500,
      })

      const result = JSON.parse(completion.choices[0].message.content)
      return {
        recommendation: result.recommendation,
        confidence: Math.min(100, Math.max(0, result.confidence)),
        reasoning: result.reasoning,
      }
    } catch (error) {
      console.error(`⚠️ Failed to parse Groq response for ${this.name}, using fallback`)
      return this.getFallbackAnalysis(proposalData)
    }
  }

  buildAnalysisPrompt(proposalData) {
    // Base prompt template
    let prompt = `
PROPOSAL ANALYSIS REQUEST

Title: ${proposalData.title}
Description: ${proposalData.description}
Amount Requested: ${proposalData.amount} cBTC
Category: ${proposalData.category || "Infrastructure"}
Urgency: ${proposalData.urgency || "Normal"}

`

    // Add specialization-specific analysis focus
    switch (this.specialization) {
      case "Risk Assessment":
        prompt += `
As a Risk Assessment agent, evaluate:
1. Technical feasibility and complexity risks
2. Financial risk vs community benefit
3. Implementation timeline risks
4. Potential negative outcomes or failures
5. Regulatory or compliance issues

Focus on identifying potential problems and assessing overall risk level.`
        break

      case "Financial Analysis":
        prompt += `
As a Financial Analysis agent, evaluate:
1. Budget reasonableness and cost breakdown
2. Value for money assessment
3. Comparison with similar projects
4. Long-term financial impact on treasury
5. Return on community investment

Focus on ensuring efficient use of treasury funds.`
        break

      case "Community Impact":
        prompt += `
As a Community Impact agent, evaluate:
1. Number of community members who will benefit
2. Social and quality of life improvements
3. Equity and accessibility considerations
4. Community support and alignment with needs
5. Long-term community development impact

Focus on maximizing positive community outcomes.`
        break

      case "Technical Feasibility":
        prompt += `
As a Technical Feasibility agent, evaluate:
1. Technical complexity and implementation requirements
2. Available expertise and resources needed
3. Implementation methodology and timeline
4. Maintenance and sustainability needs
5. Success probability assessment

Focus on whether the project can realistically be completed successfully.`
        break
    }

    return prompt
  }

  getFallbackAnalysis(proposalData) {
    // Simple rule-based fallback if Groq fails
    const amount = Number.parseFloat(proposalData.amount)
    const title = proposalData.title.toLowerCase()

    let recommendation = 0
    let confidence = 60
    let reasoning = `${this.specialization} automated analysis: `

    // Simple heuristics based on specialization
    if (this.specialization === "Risk Assessment") {
      if (title.includes("emergency") || title.includes("urgent")) {
        recommendation = amount < 1.0 ? 1 : 0
        reasoning += `Emergency request detected. Risk level: ${amount < 1.0 ? "acceptable" : "elevated due to amount"}.`
      } else if (title.includes("experimental") || title.includes("new")) {
        recommendation = -1
        reasoning += "High-risk experimental project identified."
      } else {
        recommendation = amount < 0.5 ? 1 : 0
        reasoning += `Standard infrastructure request. Amount assessment: ${amount < 0.5 ? "low risk" : "moderate risk"}.`
      }
    } else if (this.specialization === "Financial Analysis") {
      if (amount < 0.1) {
        recommendation = 1
        reasoning += "Low cost, good value proposal."
      } else if (amount > 2.0) {
        recommendation = -1
        reasoning += "High cost requires more detailed justification."
      } else {
        recommendation = title.includes("repair") || title.includes("maintenance") ? 1 : 0
        reasoning += `Moderate cost. ${title.includes("repair") ? "Maintenance costs are justified." : "New project cost analysis needed."}`
      }
    } else if (this.specialization === "Community Impact") {
      if (title.includes("water") || title.includes("health") || title.includes("education")) {
        recommendation = 1
        reasoning += "High community impact: essential services identified."
        confidence = 80
      } else if (title.includes("road") || title.includes("bridge") || title.includes("transport")) {
        recommendation = 1
        reasoning += "Good community impact: infrastructure improvement."
        confidence = 70
      } else {
        recommendation = 0
        reasoning += "Moderate community impact: needs more assessment."
      }
    } else if (this.specialization === "Technical Feasibility") {
      if (title.includes("repair") || title.includes("fix")) {
        recommendation = 1
        reasoning += "High feasibility: repair work is straightforward."
        confidence = 85
      } else if (title.includes("build") || title.includes("construct")) {
        recommendation = amount < 1.0 ? 1 : 0
        reasoning += `Construction project. Feasibility: ${amount < 1.0 ? "manageable scale" : "complex project requiring detailed planning"}.`
      } else {
        recommendation = 0
        reasoning += "Standard feasibility assessment needed."
      }
    }

    return { recommendation, confidence, reasoning }
  }

  async postAnalysisMessage(proposalId, reasoning) {
    try {
      const tx = await this.messengerContract.postMessage(
        proposalId,
        1, // Message type: ANALYSIS_POSTED
        `${this.specialization} Analysis: ${reasoning}`,
      )
      await tx.wait()
      console.log(`📝 ${this.name} posted analysis message`)
    } catch (error) {
      console.error(`❌ Failed to post message:`, error.message)
    }
  }

  async submitAnalysis(proposalId, analysis) {
    try {
      const tx = await this.stakingContract.submitAnalysis(
        proposalId,
        analysis.recommendation,
        analysis.confidence,
        `ipfs://analysis-${this.name}-${proposalId}`, // Mock IPFS hash
      )
      await tx.wait()
      console.log(
        `✅ ${this.name} submitted analysis: ${analysis.recommendation > 0 ? "APPROVE" : analysis.recommendation < 0 ? "REJECT" : "NEUTRAL"} (${analysis.confidence}% confidence)`,
      )
    } catch (error) {
      console.error(`❌ Failed to submit analysis:`, error.message)
    }
  }
}

class ProposalManager {
  constructor(agentManager) {
    this.agentManager = agentManager
    this.proposals = new Map() // Store proposal data
    this.proposalAgents = new Map() // Track which agents registered for each proposal

    // Setup consensus contract
    this.consensusContract = new ethers.Contract(
      CONTRACT_ADDRESSES.CONSENSUS_ENGINE,
      CONSENSUS_ENGINE_ABI,
      agentManager.agents[0].provider, // Use any agent's provider
    )
  }

  // STEP 1: Human submits proposal
  async submitProposal(proposalData) {
    console.log("\n🏗️ NEW PROPOSAL SUBMITTED")
    console.log("==========================")
    console.log(`📋 Title: "${proposalData.title}"`)
    console.log(`💰 Amount: ${proposalData.amount} cBTC`)
    console.log(`📝 Description: ${proposalData.description.substring(0, 100)}...`)

    // Store proposal
    this.proposals.set(proposalData.id, proposalData)
    this.proposalAgents.set(proposalData.id, [])

    // STEP 2: Let agents decide if they want to participate
    await this.letAgentsEvaluateProposal(proposalData)

    return proposalData.id
  }

  // STEP 2: Agents evaluate and register if interested
  async letAgentsEvaluateProposal(proposalData) {
    console.log(`\n🤖 AGENTS EVALUATING PROPOSAL ${proposalData.id}`)
    console.log("========================================")

    const registeredAgents = []

    for (const agent of this.agentManager.agents) {
      const shouldRegister = await agent.evaluateProposalRelevance(proposalData)

      if (shouldRegister) {
        const success = await agent.registerForProposal(proposalData.id, proposalData)
        if (success) {
          registeredAgents.push(agent)
        }
      }
    }

    this.proposalAgents.set(proposalData.id, registeredAgents)

    console.log(`\n📊 REGISTRATION COMPLETE:`)
    console.log(`   Interested Agents: ${registeredAgents.length}/${this.agentManager.agents.length}`)
    registeredAgents.forEach((agent) => {
      console.log(`   ✅ ${agent.name} (${agent.specialization})`)
    })

    if (registeredAgents.length === 0) {
      console.log("   ⚠️  No agents interested - proposal may need revision")
    }

    return registeredAgents
  }

  // STEP 3: Get proposal status for frontend
  getProposalStatus(proposalId) {
    const proposal = this.proposals.get(proposalId)
    const registeredAgents = this.proposalAgents.get(proposalId) || []

    return {
      proposal,
      registeredAgents: registeredAgents.map((agent) => ({
        name: agent.name,
        specialization: agent.specialization,
        address: agent.wallet.address,
      })),
      readyForAnalysis: registeredAgents.length > 0,
      status: "WAITING_TO_BEGIN",
    }
  }

  // STEP 4: Begin analysis (triggered by frontend "Begin Analysis" button)
  async beginAnalysis(proposalId) {
    console.log(`\n🚀 BEGINNING ANALYSIS FOR PROPOSAL ${proposalId}`)
    console.log("===============================================")

    const proposal = this.proposals.get(proposalId)
    const registeredAgents = this.proposalAgents.get(proposalId) || []

    if (registeredAgents.length === 0) {
      console.log("❌ No agents registered - cannot begin analysis")
      return null
    }

    console.log(`🔍 ${registeredAgents.length} agents will analyze this proposal...`)

    // Run analysis for only the registered agents (in parallel)
    const analysisPromises = registeredAgents.map((agent) => agent.analyzeProposal(proposal))

    const results = await Promise.all(analysisPromises)

    // Wait for transactions to be mined
    await this.sleep(8000)

    // Calculate consensus with only registered agents
    await this.calculateConsensus(proposalId)

    return results
  }

  async calculateConsensus(proposalId) {
    try {
      console.log(`\n⚖️ CALCULATING CONSENSUS for Proposal ${proposalId}...`)

      const registeredAgents = this.proposalAgents.get(proposalId) || []
      console.log(`📊 Based on ${registeredAgents.length} agent analyses:`)

      // Get current consensus state from smart contract
      const consensusState = await this.consensusContract.getConsensusState(proposalId)

      console.log(`📊 Current Consensus State:`)
      console.log(`   Consensus Reached: ${consensusState.consensusReached}`)
      console.log(
        `   Final Decision: ${consensusState.finalDecision === 1n ? "APPROVED" : consensusState.finalDecision === -1n ? "REJECTED" : "PENDING"}`,
      )
      console.log(`   Approval Weight: ${consensusState.approvalWeight.toString()}`)
      console.log(`   Total Weight: ${consensusState.totalWeight.toString()}`)

      if (consensusState.totalWeight > 0) {
        const approvalRate = (Number(consensusState.approvalWeight) / Number(consensusState.totalWeight)) * 100
        console.log(`   📈 Approval Rate: ${approvalRate.toFixed(1)}%`)

        if (approvalRate >= 70) {
          console.log("✅ PROPOSAL APPROVED - Ready for execution!")
        } else if (approvalRate <= 30) {
          console.log("❌ PROPOSAL REJECTED")
        } else {
          console.log("⏳ PROPOSAL PENDING - Need more consensus")
        }
      }
    } catch (error) {
      console.error("❌ Consensus calculation failed:", error.message)
    }
  }

  // List all proposals with their status
  listProposals() {
    console.log("\n📋 ALL PROPOSALS")
    console.log("=================")

    for (const [id, proposal] of this.proposals) {
      const registeredAgents = this.proposalAgents.get(id) || []
      console.log(`\n${id}. "${proposal.title}"`)
      console.log(`   Amount: ${proposal.amount} cBTC`)
      console.log(`   Registered Agents: ${registeredAgents.length}/4`)
      registeredAgents.forEach((agent) => {
        console.log(`     - ${agent.name} (${agent.specialization})`)
      })
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

class AgentManager {
  constructor() {
    this.agents = []
    this.setupAgents()
  }

  setupAgents() {
    // Create 4 specialized agents
    this.agents = [
      new AIAgent(
        "RiskBot",
        "Risk Assessment",
        process.env.RISK_AGENT_PRIVATE_KEY,
        0.000001, // 0.01 cBTC stake per proposal
      ),
      new AIAgent(
        "FinanceBot",
        "Financial Analysis",
        process.env.FINANCE_AGENT_PRIVATE_KEY,
        0.0000015, // 0.015 cBTC stake per proposal
      ),
      new AIAgent(
        "CommunityBot",
        "Community Impact",
        process.env.COMMUNITY_AGENT_PRIVATE_KEY,
        0.0000002, // 0.02 cBTC stake per proposal
      ),
      new AIAgent(
        "TechBot",
        "Technical Feasibility",
        process.env.TECH_AGENT_PRIVATE_KEY,
        0.0000012, // 0.012 cBTC stake per proposal
      ),
    ]
  }

  async initializeAllAgents() {
    console.log("🚀 Initializing AI Agent Network...")
    console.log("📡 Connecting to Citrea Testnet:", CITREA_CONFIG.rpcUrl)

    // Just setup the agents, they register dynamically per proposal
    for (const agent of this.agents) {
      console.log(`✅ ${agent.name} (${agent.specialization}) ready`)
    }

    console.log("✅ All agents initialized and ready to evaluate proposals!")
  }
}

// Main execution
async function main() {
  const agentManager = new AgentManager()
  const proposalManager = new ProposalManager(agentManager)

  // Initialize agent network
  await agentManager.initializeAllAgents()

  // Check run mode
  const runMode = process.argv[2]

  if (runMode === "demo") {
    await runInteractiveDemo(proposalManager)
  } else if (runMode === "server") {
    // Run as server for frontend integration
    console.log("\n🖥️ Starting proposal server...")
    console.log("Ready to receive proposals from frontend!")

    // Keep process alive (in real implementation, this would be Express server)
    process.stdin.resume()
  } else {
    // Manual demo mode
    await runInteractiveDemo(proposalManager)
  }
}

async function runInteractiveDemo(proposalManager) {
  console.log("\n🎭 INTERACTIVE AI GOVERNANCE DEMO")
  console.log("=================================")

  // Demo proposals with different characteristics to show dynamic agent selection
  const demoProposals = [
    {
      id: 1,
      title: "Emergency Water Pump Repair",
      description:
        "The main community water pump has broken down and needs immediate repair. This affects 150 families who currently have no access to clean water. Local technician available, just need parts.",
      amount: 0.05,
      category: "Emergency Infrastructure",
      urgency: "Critical",
      recipient: "0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234",
    },
    {
      id: 2,
      title: "Advanced Quantum Computing Research Lab",
      description:
        "Establish a cutting-edge quantum computing research facility for the community. This experimental technology could revolutionize our local economy, though success is uncertain and costs are very high.",
      amount: 5.0,
      category: "Experimental Technology",
      urgency: "Low",
      recipient: "0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234",
    },
    {
      id: 3,
      title: "Community Garden Maintenance Tools",
      description:
        "Purchase basic gardening tools and materials for our community garden. Will benefit 50 families who grow their own food and help reduce grocery costs. Simple, low-cost community project.",
      amount: 0.08,
      category: "Community Welfare",
      urgency: "Normal",
      recipient: "0x742d35Cc6634C0532925a3b8D95b1d31A1b6C234",
    },
  ]

  console.log("\n📝 STEP 1: Humans Submit Proposals")
  console.log("=====================================")

  // Submit all proposals and let agents evaluate
  for (const proposal of demoProposals) {
    await proposalManager.submitProposal(proposal)
    await sleep(3000) // Brief pause between proposals
  }

  // Show current status of all proposals
  proposalManager.listProposals()

  console.log("\n🎯 STEP 2: Creator Begins Analysis for Ready Proposals")
  console.log("========================================================")

  // Simulate creator starting analysis for proposals that have interested agents
  for (const proposal of demoProposals) {
    const status = proposalManager.getProposalStatus(proposal.id)

    if (status.readyForAnalysis) {
      console.log(`\n🚀 Creator clicks "Begin Analysis" for Proposal ${proposal.id}...`)
      await proposalManager.beginAnalysis(proposal.id)
      console.log("\n" + "=".repeat(60))
      await sleep(5000)
    } else {
      console.log(`\n⏸️  Skipping Proposal ${proposal.id} - no interested agents`)
    }
  }

  console.log("\n🎉 Demo completed!")
  console.log("\n📊 Key Insights:")
  console.log("   - Agents self-select based on proposal relevance")
  console.log("   - Only interested agents stake cBTC and participate")
  console.log("   - Creator controls when analysis begins")
  console.log("   - Full transparency via ERC-8004 audit trail")
  console.log("\n🔗 Check Citrea explorer for all transactions!")
  console.log(`📊 AI Agent Staking: https://explorer.testnet.citrea.xyz/address/${CONTRACT_ADDRESSES.AI_AGENT_STAKING}`)
  console.log(`⚖️ Consensus Engine: https://explorer.testnet.citrea.xyz/address/${CONTRACT_ADDRESSES.CONSENSUS_ENGINE}`)
  console.log(
    `📝 ERC-8004 Messages: https://explorer.testnet.citrea.xyz/address/${CONTRACT_ADDRESSES.ERC8004_MESSENGER}`,
  )
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Export for frontend integration
export { AgentManager, AIAgent, ProposalManager }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
