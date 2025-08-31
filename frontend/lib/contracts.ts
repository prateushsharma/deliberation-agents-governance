import { ethers } from "ethers"

// Citrea Network Configuration
export const CITREA_CONFIG = {
  rpcUrl: "https://rpc.testnet.citrea.xyz",
  chainId: 5115,
  name: "Citrea Testnet",
  currency: "cBTC",
  explorerUrl: "https://explorer.testnet.citrea.xyz",
}

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  AI_AGENT_STAKING: "0xaC855951321913A8dBBb7631A5DbcbcE2366570C",
  CONSENSUS_ENGINE: "0xd5D80311b62e32A7D519636796cEFB1C37757362",
  ERC8004_MESSENGER: "0x7A26B68b9DFBeb0284076F4fC959e01044a21DCa",
} as const

// Contract ABIs
export const AI_AGENT_STAKING_ABI = [
  "function registerAgent(string specialization, string ipfsProfile) external payable",
  "function registerForProposal(uint256 proposalId, string specialization) external payable",
  "function submitAnalysis(uint256 proposalId, int8 recommendation, uint8 confidence, string ipfsHash) external",
  "function getProposalAnalyses(uint256 proposalId) external view returns (tuple(address agent, string specialization, int8 recommendation, uint8 confidence, string reasoning, uint256 timestamp)[])",
  "function getProposalAgents(uint256 proposalId) external view returns (address[] agents)",
  "function agents(address) external view returns (string specialization, uint256 stake, uint256 accuracy, bool isActive)",
  "event AgentRegistered(address indexed agent, string specialization, uint256 stake)",
  "event AnalysisSubmitted(uint256 indexed proposalId, address indexed agent, int8 recommendation, uint8 confidence)",
] as const

export const CONSENSUS_ENGINE_ABI = [
  "function calculateConsensus(uint256 proposalId) external",
  "function getConsensusState(uint256 proposalId) external view returns (bool consensusReached, int8 finalDecision, uint256 approvalWeight, uint256 totalWeight)",
  "function setProposalPayment(uint256 proposalId, address recipient, uint256 amount) external",
  "function addAgentAnalysis(uint256 proposalId, address agentAddress, int8 recommendation, uint8 confidence, uint256 stakeAmount) external",
  "event ConsensusReached(uint256 indexed proposalId, int8 finalDecision, uint256 approvalWeight, uint256 totalWeight)",
  "event PaymentExecuted(uint256 indexed proposalId, address recipient, uint256 amount)",
] as const

export const ERC8004_MESSENGER_ABI = [
  "function postMessage(uint256 proposalId, uint8 messageType, string content) external",
  "function getProposalThread(uint256 proposalId) external view returns (tuple(address sender, string content, uint256 timestamp, uint8 messageType)[])",
  "event MessagePosted(uint256 indexed proposalId, address indexed sender, string content, uint8 messageType)",
] as const

// Provider setup
export function getProvider() {
  return new ethers.JsonRpcProvider(CITREA_CONFIG.rpcUrl)
}

// Contract instances
export function getStakingContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESSES.AI_AGENT_STAKING, AI_AGENT_STAKING_ABI, provider)
}

export function getConsensusContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESSES.CONSENSUS_ENGINE, CONSENSUS_ENGINE_ABI, provider)
}

export function getMessengerContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESSES.ERC8004_MESSENGER, ERC8004_MESSENGER_ABI, provider)
}

// Utility functions
export function formatCBTC(amount: bigint): string {
  return ethers.formatUnits(amount, 8) // cBTC has 8 decimals
}

export function parseCBTC(amount: string): bigint {
  return ethers.parseUnits(amount, 8)
}

// Network detection
export async function isCorrectNetwork(provider: ethers.Provider): Promise<boolean> {
  try {
    const network = await provider.getNetwork()
    return Number(network.chainId) === CITREA_CONFIG.chainId
  } catch {
    return false
  }
}

// Add Citrea network to wallet
export async function addCitreaNetwork() {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${CITREA_CONFIG.chainId.toString(16)}`,
            chainName: CITREA_CONFIG.name,
            nativeCurrency: {
              name: "Citrea Bitcoin",
              symbol: "cBTC",
              decimals: 8,
            },
            rpcUrls: [CITREA_CONFIG.rpcUrl],
            blockExplorerUrls: [CITREA_CONFIG.explorerUrl],
          },
        ],
      })
      return true
    } catch (error) {
      console.error("Failed to add Citrea network:", error)
      return false
    }
  }
  return false
}
