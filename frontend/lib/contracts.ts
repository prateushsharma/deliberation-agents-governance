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
  PROPOSAL_REGISTRY: "0x3c8CF76cA8125CfD6D01C2DAB0CE04655Cc33f26",
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

export const PROPOSAL_REGISTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum ProposalRegistry.ProposalStatus",
        name: "newStatus",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "address",
        name: "updater",
        type: "address",
      },
    ],
    name: "ProposalStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "submitter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ProposalSubmitted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_title",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_recipient",
        type: "string",
      },
    ],
    name: "submitProposal",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
      {
        internalType: "enum ProposalRegistry.ProposalStatus",
        name: "_newStatus",
        type: "uint8",
      },
    ],
    name: "updateProposalStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "activeProposalIds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllActiveProposals",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_proposalId",
        type: "uint256",
      },
    ],
    name: "getProposal",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "title",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "submitter",
            type: "address",
          },
          {
            internalType: "string",
            name: "recipient",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "enum ProposalRegistry.ProposalStatus",
            name: "status",
            type: "uint8",
          },
        ],
        internalType: "struct ProposalRegistry.Proposal",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProposalCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ProposalRegistry.ProposalStatus",
        name: "_status",
        type: "uint8",
      },
    ],
    name: "getProposalsByStatus",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_submitter",
        type: "address",
      },
    ],
    name: "getProposalsBySubmitter",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_count",
        type: "uint256",
      },
    ],
    name: "getRecentProposals",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proposalCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "submitter",
        type: "address",
      },
      {
        internalType: "string",
        name: "recipient",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "enum ProposalRegistry.ProposalStatus",
        name: "status",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
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

export function getProposalRegistryContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider()
  return new ethers.Contract(CONTRACT_ADDRESSES.PROPOSAL_REGISTRY, PROPOSAL_REGISTRY_ABI, provider)
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
