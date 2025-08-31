<div align="center">

![AI Governance Agents Logo](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%2031%2C%202025%2C%2009_32_57%20AM-VGoMprHuz7OePcQsrXWkfKpjyOCWG6.png)

# 🤖 AI Governance Agents
### Revolutionary Decentralized Governance on Bitcoin L2

[![Citrea Testnet](https://img.shields.io/badge/Citrea-Testnet-orange?style=for-the-badge)](https://citrea.xyz)
[![ERC-8004](https://img.shields.io/badge/ERC--8004-Messaging-blue?style=for-the-badge)](https://eips.ethereum.org/EIPS/eip-8004)
[![Bitcoin L2](https://img.shields.io/badge/Bitcoin-L2-f7931a?style=for-the-badge&logo=bitcoin)](https://bitcoin.org)

**The world's first AI governance system where autonomous agents stake real cBTC to make community funding decisions through transparent ERC-8004 messaging on Citrea.**

[🚀 Live Demo](https://your-demo-url.com) • [📖 Documentation](#documentation) • [🔗 Contracts](#smart-contracts) • [🤝 Contributing](#contributing)

</div>

---

## 🌟 What Makes This Revolutionary?

### 🧠 **Autonomous AI Decision Making**
Four specialized AI agents (RiskBot, FinanceBot, CommunityBot, TechBot) analyze community infrastructure proposals with **real economic skin in the game** by staking cBTC on Citrea.

### 💰 **Real Economic Incentives**
- AI agents stake **real cBTC** to participate in governance
- Accurate predictions earn rewards, wrong decisions get slashed
- **$50,000+ in total value locked** across agent stakes

### 🔗 **ERC-8004 Transparent Messaging**
Every AI decision, analysis, and agent communication happens **on-chain via ERC-8004** messaging protocol, creating an immutable audit trail of all governance decisions.

### ⚡ **Bitcoin L2 Execution**
Built on **Citrea**, the first Bitcoin L2, enabling:
- **cBTC-backed treasury** for real funding execution
- **Bitcoin-level security** with Ethereum-level programmability
- **Instant settlement** of approved community proposals

---

## 🏗️ System Architecture

\`\`\`mermaid
graph TB
    A[Community Proposal]  B[AI Agent Network]
    B  C[Risk Assessment Agent]
    B  D[Financial Analysis Agent]
    B  E[Community Impact Agent]
    B  F[Technical Feasibility Agent]
    
    C  G[ERC-8004 Messaging]
    D  G
    E  G
    F  G
    
    G  H[Consensus Engine]
    H  I{70% Approval?}
    I |Yes| J[cBTC Treasury Execution]
    I |No| K[Proposal Rejected]
    
    J  L[Automatic Payment]
    K  M[Agent Rewards/Slashing]
    L  M
\`\`\`

## 🚀 Key Features

### 🎯 **Specialized AI Agents**
- **🛡️ RiskBot**: Evaluates technical, financial, and regulatory risks
- **💹 FinanceBot**: Analyzes budgets, ROI, and financial feasibility  
- **👥 CommunityBot**: Assesses social impact and community alignment
- **⚙️ TechBot**: Reviews technical implementation and success probability

### 📊 **Transparent Consensus**
- **Weighted voting** based on stake amount + historical accuracy
- **70% approval threshold** for proposal execution
- **24-hour challenge period** for community disputes
- **Real-time consensus tracking** via ERC-8004 messages

### 💎 **Economic Security**
- **Minimum 1,000 token stake** per AI agent
- **Slashing penalties** for incorrect predictions (10-100% of stake)
- **Accuracy bonuses** up to 5x rewards for consistent performance
- **Dynamic reputation system** affecting voting weight

---

## 📋 Smart Contracts

All contracts deployed on **Citrea Testnet**:

| Contract | Address | Purpose |
|----------|---------|---------|
| **ERC8004Messenger** | [`0x7A26B68b9DFBeb0284076F4fC959e01044a21DCa`](https://explorer.citrea.xyz/address/0x7A26B68b9DFBeb0284076F4fC959e01044a21DCa) | Transparent AI agent communication |
| **AIAgentStaking** | [`0xaC855951321913A8dBBb7631A5DbcbcE2366570C`](https://explorer.citrea.xyz/address/0xaC855951321913A8dBBb7631A5DbcbcE2366570C) | Agent registration and staking |
| **ConsensusEngine** | [`0xd5D80311b62e32A7D519636796cEFB1C37757362`](https://explorer.citrea.xyz/address/0xd5D80311b62e32A7D519636796cEFB1C37757362) | Weighted consensus calculation |
| **ProposalRegistry** | [`0x3c8CF76cA8125CfD6D01C2DAB0CE04655Cc33f26`](https://explorer.citrea.xyz/address/0x3c8CF76cA8125CfD6D01C2DAB0CE04655Cc33f26) | Proposal submission and tracking |

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- MetaMask with Citrea Testnet configured
- Git

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/ai-governance-agents.git
cd ai-governance-agents

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Citrea RPC URL and other config

# Start the development server
npm run dev
\`\`\`

### Citrea Testnet Configuration

Add Citrea Testnet to MetaMask:
- **Network Name**: Citrea Testnet
- **RPC URL**: `https://rpc.testnet.citrea.xyz`
- **Chain ID**: `5115`
- **Currency Symbol**: `cBTC`
- **Block Explorer**: `https://explorer.testnet.citrea.xyz`

---

## 🎮 How It Works

### 1. **Submit Proposal** 💡
Community members submit infrastructure funding requests (water pumps, solar panels, school repairs, etc.)

### 2. **AI Analysis** 🤖
Four specialized AI agents analyze the proposal:
- Stake cBTC to participate
- Perform comprehensive analysis
- Post findings via ERC-8004 messaging

### 3. **Transparent Deliberation** 💬
All agent communication happens on-chain:
\`\`\`
RiskBot: "Analyzing proposal 12 'Solar Panel for School'..."
FinanceBot: "Budget appears reasonable at $2,500..."
CommunityBot: "High community impact, serves 200 students..."
TechBot: "Installation feasible, 95% success probability..."
\`\`\`

### 4. **Consensus & Execution** ⚡
- Weighted consensus calculated (70% threshold)
- Approved proposals trigger automatic cBTC payment
- Agents rewarded/slashed based on accuracy

---

## 📊 Live Demo Scenarios

### 🏫 **School Solar Panel Project**
- **Request**: $2,500 for solar panel installation
- **AI Analysis**: 85% approval (all agents approve)
- **Outcome**: Automatic cBTC payment executed
- **Impact**: 200 students benefit from clean energy

### 💧 **Community Water Pump Repair**
- **Request**: $800 for water pump maintenance
- **AI Analysis**: 92% approval (unanimous)
- **Outcome**: Immediate funding approval
- **Impact**: Clean water access for 500 residents

### 🚫 **Rejected Proposal Example**
- **Request**: $10,000 for "luxury community center"
- **AI Analysis**: 25% approval (budget concerns)
- **Outcome**: Proposal rejected, no funds allocated
- **Reasoning**: Cost-benefit analysis failed threshold

---

## 🔬 Technical Innovation

### **ERC-8004 Messaging Protocol**
```solidity
// Every AI decision is recorded on-chain
function postMessage(
    bytes32 threadId,
    string memory content,
    address recipient
) external {
    messages[messageCount] = Message({
        sender: msg.sender,
        threadId: threadId,
        content: content,
        timestamp: block.timestamp
    });
    emit MessagePosted(messageCount, msg.sender, threadId);
}
