// agents/src/AgentManager.js
// REST mode • Chain polling (latest proposal) • “Real-looking” virtual staking & txs • CORS enabled
console.log('🤖 Agents (REST) — latest-proposal polling + realistic virtual staking');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { ethers } from 'ethers';
import { randomBytes } from 'crypto';
dotenv.config();

/* ==============================
   CONFIG
============================== */
const AMOUNT_DECIMALS = 8; // change if your contract uses 18
const CITREA = {
  rpcUrl: 'https://rpc.testnet.citrea.xyz',
  chainId: 5115,
  name: 'citrea-testnet',
};

const CONTRACT_ADDRESSES = {
  PROPOSAL_REGISTRY: '0x3c8CF76cA8125CfD6D01C2DAB0CE04655Cc33f26',
  AI_AGENT_STAKING:   '0xaC855951321913A8dBBb7631A5DbcbcE2366570C',
  CONSENSUS_ENGINE:   '0xd5D80311b62e32A7D519636796cEFB1C37757362',
  ERC8004_MESSENGER:  '0x7A26B68b9DFBeb0284076F4fC959e01044a21DCa',
};

const PROPOSAL_REGISTRY_ABI = [
  "function getProposal(uint256) external view returns (tuple(uint256 id, string title, string description, uint256 amount, address submitter, string recipient, uint256 timestamp, uint8 status))",
  "function getProposalCount() external view returns (uint256)",
  "event ProposalSubmitted(uint256 indexed proposalId, address indexed submitter, string title, uint256 amount)"
];

/* ==============================
   LOG BUFFER (REST-friendly)
============================== */
const LOG_MAX = 1000;
let LOGS = [];
function addLog(level, text, data) {
  const entry = { ts: Date.now(), level, text, data };
  LOGS.push(entry);
  if (LOGS.length > LOG_MAX) LOGS = LOGS.slice(-LOG_MAX);
  const line = `[${new Date(entry.ts).toISOString()}] ${level.toUpperCase()} ${text}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

/* ==============================
   HELPERS (realistic feel)
============================== */
const rnd = (min, max) => Math.random() * (max - min) + min;
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const fakeTx = () => '0x' + randomBytes(32).toString('hex');
let FAKE_BLOCK = 1_234_000;
async function confirmTx(txHash, label = 'tx') {
  const gasUsed = Math.floor(rnd(45_000, 120_000));
  const block = ++FAKE_BLOCK;
  addLog('info', `⛏️  mined ${label} ${txHash.slice(0,10)}… | block ${block} | gas ${gasUsed}`);
  await sleep(rnd(300, 700));
  const confs = choice([1, 2, 3]);
  for (let i = 1; i <= confs; i++) {
    addLog('info', `✅ ${label} ${txHash.slice(0,10)}… confirmations: ${i}`);
    await sleep(rnd(250, 500));
  }
}

/* ==============================
   EXPRESS (REST) + CORS
============================== */
const app = express();
app.use(express.json());

// Permissive CORS (works for v0/Vercel previews and localhost)
app.use(cors({ origin: true, methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.use((req, res, next) => { res.setHeader('Vary', 'Origin'); next(); });

// GET /logs?limit=200 or /logs?since=timestamp
app.get('/logs', (req, res) => {
  const since = Number(req.query.since || 0);
  const limit = Math.min(Number(req.query.limit || 200), 1000);
  const out = since ? LOGS.filter(l => l.ts > since) : LOGS.slice(-limit);
  res.json({ ok: true, logs: out, now: Date.now() });
});

// Health/status
app.get('/status', (_req, res) => {
  res.json({ ok: true, network: CITREA.name, watching: CONTRACT_ADDRESSES.PROPOSAL_REGISTRY });
});

// Optional helpers: push demo or manual proposal
app.get('/demo', async (_req, res) => {
  const demo = [
    { id: 1, title: "Emergency Water Pump Repair", description: "Restore clean water to 150 families", amount: 0.05 },
    { id: 2, title: "Solar Panel Installation for School", description: "Install 20kW rooftop solar", amount: 1.25 }
  ];
  for (const p of demo) {
    addLog('info', `🔔 Demo proposal: #${p.id} "${p.title}"`);
    await proposalManager.evaluateProposal(p);
    await sleep(800);
  }
  res.json({ ok: true, count: demo.length });
});

app.post('/proposal', async (req, res) => {
  const { id, title, description = '', amount = 0 } = req.body || {};
  if (!id || !title) return res.status(400).json({ ok: false, error: 'id and title required' });
  const p = { id: Number(id), title: String(title), description: String(description), amount: Number(amount) };
  addLog('info', `🔔 API proposal received: #${p.id} "${p.title}"`);
  await proposalManager.evaluateProposal(p);
  res.json({ ok: true });
});

/* ==============================
   PROVIDER + CONTRACT (ethers v5)
============================== */
const provider = new ethers.providers.JsonRpcProvider(
  CITREA.rpcUrl,
  { name: CITREA.name, chainId: CITREA.chainId }
);
const proposalContract = new ethers.Contract(
  CONTRACT_ADDRESSES.PROPOSAL_REGISTRY,
  PROPOSAL_REGISTRY_ABI,
  provider
);
// topic0 for ProposalSubmitted(uint256,address,string,uint256)
const TOPIC_PROPOSAL_SUBMITTED = ethers.utils.id("ProposalSubmitted(uint256,address,string,uint256)");

/* ==============================
   AGENT (real-looking virtual ops)
============================== */
class AIAgent {
  constructor(name, specialization) {
    this.name = name;
    this.specialization = specialization;
    this.registeredProposals = new Set();

    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
      try {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        addLog('info', `✅ ${name}: Real AI enabled`);
      } catch {
        this.groq = null;
        addLog('warn', `⚠️ ${name}: Groq init failed, using fallback`);
      }
    } else {
      this.groq = null;
      addLog('warn', `⚠️ ${name}: No Groq key, using fallback`);
    }
  }

  getFallbackRelevance(p) {
    const t = (p.title || '').toLowerCase();
    const amt = Number(p.amount || 0);
    switch (this.specialization) {
      case 'Risk Assessment': return 8;
      case 'Financial Analysis': return amt > 1 ? 9 : amt > 0.5 ? 7 : 5;
      case 'Community Impact': return /(community|water|school|education|health|power|electric|solar)/.test(t) ? 9 : 6;
      case 'Technical Feasibility': return /(build|repair|install|solar|power|electric|maintenance)/.test(t) ? 9 : 4;
      default: return 5;
    }
  }

  async evaluateProposalRelevance(proposal) {
    addLog('info', `🤔 ${this.name} evaluating: "${proposal.title}"`);
    let score = 7;
    if (this.groq) {
      try {
        const c = await this.groq.chat.completions.create({
          messages: [
            { role: 'system', content: `You are a ${this.specialization} agent. Rate relevance 1-10. Reply only the number.` },
            { role: 'user', content: `Title: ${proposal.title}\nDesc: ${proposal.description}\nAmount: ${proposal.amount} cBTC` }
          ],
          model: 'llama3-8b-8192', temperature: 0.2, max_tokens: 5
        });
        const parsed = parseInt(c.choices[0].message.content.trim());
        if (!Number.isNaN(parsed)) score = Math.max(1, Math.min(10, parsed));
      } catch { score = this.getFallbackRelevance(proposal); }
    } else {
      score = this.getFallbackRelevance(proposal);
    }
    const will = score > 6;
    addLog('info', `   📊 Relevance: ${score}/10 — ${will ? 'interested' : 'skip'}`);
    return will;
  }

  getFallbackAnalysis(p) {
    const t = (p.title || '').toLowerCase();
    const amt = Number(p.amount || 0);
    let recommendation = 0, confidence = 70, reasoning = `${this.specialization} analysis: `;
    if (this.specialization === 'Risk Assessment') {
      if (/emergency/.test(t)) { recommendation = amt < 1 ? 1 : 0; confidence = 80; reasoning += 'Emergency; acceptable/moderate risk.'; }
      else if (/experimental/.test(t)) { recommendation = -1; confidence = 85; reasoning += 'High uncertainty & risk.'; }
      else { recommendation = amt < 0.5 ? 1 : 0; reasoning += 'Standard infra; low/moderate risk.'; }
    } else if (this.specialization === 'Financial Analysis') {
      if (amt < 0.1) { recommendation = 1; confidence = 85; reasoning += 'Low cost, good value.'; }
      else if (amt > 2.0) { recommendation = -1; confidence = 80; reasoning += 'High cost; needs justification.'; }
      else { recommendation = /repair/.test(t) ? 1 : 0; reasoning += /repair/.test(t) ? 'Maintenance justified.' : 'Needs CBA.'; }
    } else if (this.specialization === 'Community Impact') {
      if (/(water|health|education|school|power|electric|solar)/.test(t)) { recommendation = 1; confidence = 90; reasoning += 'Essential services; high impact.'; }
      else if (/community/.test(t)) { recommendation = 1; confidence = 75; reasoning += 'Community-focused initiative.'; }
      else { recommendation = 0; reasoning += 'Moderate impact; more input.'; }
    } else if (this.specialization === 'Technical Feasibility') {
      if (/(repair|maintenance)/.test(t)) { recommendation = 1; confidence = 90; reasoning += 'High feasibility.'; }
      else if (/(experimental|research)/.test(t)) { recommendation = -1; confidence = 85; reasoning += 'Low feasibility.'; }
      else { recommendation = /install|solar|power|electric/.test(t) ? 1 : 0; reasoning += /install|solar|power|electric/.test(t) ? 'Feasible install.' : 'Needs assessment.'; }
    }
    return { recommendation, confidence, reasoning };
  }

  async registerForProposal(proposalId) {
    if (this.registeredProposals.has(proposalId)) return true;

    // thinking
    addLog('info', `🧠 ${this.name} considering stake on proposal ${proposalId}…`);
    await sleep(rnd(400, 1200));

    // decision (specialization-weighted)
    const baseProb = ({
      'Risk Assessment': 0.8,
      'Financial Analysis': 0.7,
      'Community Impact': 0.75,
      'Technical Feasibility': 0.65,
    }[this.specialization]) ?? 0.6;

    const stakeDecision = Math.random() < baseProb;
    if (!stakeDecision) {
      addLog('warn', `🛑 ${this.name} chose NOT to stake on ${proposalId} (insufficient conviction)`);
      return false;
    }

    // fake staking tx
    const tx = fakeTx();
    addLog('info', `📝 ${this.name} staking… sent tx ${tx.slice(0,10)}…`);
    await sleep(rnd(500, 1200));
    await confirmTx(tx, 'stake');

    this.registeredProposals.add(proposalId);
    addLog('info', `🟢 ${this.name} is now registered (staked) on ${proposalId}`);
    return true;
  }

  async analyzeProposal(proposal) {
    addLog('info', `🔎 ${this.name} reading proposal ${proposal.id} "${proposal.title}"`);
    await sleep(rnd(600, 1500));
    addLog('info', `🧰 ${this.name} gathering data…`);
    await sleep(rnd(500, 1200));

    let analysis;
    try {
      if (!this.groq) throw new Error('no groq');
      const c = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: `You are a ${this.specialization} agent. Respond JSON: {"recommendation":-1|0|1,"confidence":0-100,"reasoning":"..."} (only JSON)` },
          { role: 'user', content: `Title: ${proposal.title}\nDesc: ${proposal.description}\nAmount: ${proposal.amount} cBTC` }
        ],
        model: 'llama3-8b-8192', temperature: 0.2, max_tokens: 300
      });
      analysis = JSON.parse(c.choices[0].message.content);
      if (![ -1, 0, 1 ].includes(Number(analysis.recommendation))) throw new Error('bad rec');
      analysis.confidence = Math.max(0, Math.min(100, Number(analysis.confidence)));
    } catch {
      addLog('warn', `⚠️ ${this.name}: AI fallback used`);
      analysis = this.getFallbackAnalysis(proposal);
    }

    await sleep(rnd(350, 900));

    // fake submitAnalysis
    const tx1 = fakeTx();
    addLog('info', `📤 ${this.name} submitAnalysis sent ${tx1.slice(0,10)}… (rec:${analysis.recommendation}, conf:${analysis.confidence}%)`);
    await sleep(rnd(400, 1000));
    await confirmTx(tx1, 'submitAnalysis');

    // fake message post
    const tx2 = fakeTx();
    addLog('info', `🗣️  ${this.name} posted message ${tx2.slice(0,10)}…`);
    await sleep(rnd(400, 900));
    await confirmTx(tx2, 'postMessage');

    const decision = analysis.recommendation > 0 ? 'APPROVE' : analysis.recommendation < 0 ? 'REJECT' : 'NEUTRAL';
    addLog('info', `✅ ${this.name}: ${decision} (${analysis.confidence}% confidence)`);
    addLog('info', `   Reasoning: ${analysis.reasoning.slice(0, 140)}…`);
    return analysis;
  }
}

/* ==============================
   PROPOSAL MANAGER
============================== */
class ProposalManager {
  constructor() {
    this.proposals = new Map();
    this.proposalAgents = new Map();
    this.agents = [
      new AIAgent('RiskBot', 'Risk Assessment'),
      new AIAgent('FinanceBot', 'Financial Analysis'),
      new AIAgent('CommunityBot', 'Community Impact'),
      new AIAgent('TechBot', 'Technical Feasibility'),
    ];
    this.lastBlock = 0;
    this.pollIntervalMs = 5000;
  }

  async startChainWatcher() {
    addLog('info', '👂 Starting blockchain watcher (latest-only, polling getLogs)');
    this.lastBlock = await provider.getBlockNumber();

    // On boot: process only the latest proposalId (if any)
    await this.processLatestOnBoot();

    // Poll for new logs → process only the newest proposalId seen in each window
    setInterval(() => this.pollLatest().catch(e => addLog('error', `poll error: ${e.message}`)), this.pollIntervalMs);
    addLog('info', '✅ Chain polling active');
  }

  async processLatestOnBoot() {
    try {
      const count = await proposalContract.getProposalCount();
      const n = Number(count);
      addLog('info', `📊 getProposalCount: ${n}`);
      if (n > 0) await this.processProposal(n);
    } catch (e) {
      addLog('warn', `Could not fetch proposal count on boot: ${e.message}`);
    }
  }

  async pollLatest() {
    const current = await provider.getBlockNumber();
    const fromBlock = this.lastBlock + 1;
    const toBlock = current;
    if (toBlock < fromBlock) return;

    const filter = {
      address: CONTRACT_ADDRESSES.PROPOSAL_REGISTRY,
      fromBlock,
      toBlock,
      topics: [TOPIC_PROPOSAL_SUBMITTED],
    };

    const logs = await provider.getLogs(filter);
    if (logs.length > 0) {
      let maxId = -1;
      for (const logRec of logs) {
        const parsed = proposalContract.interface.parseLog(logRec);
        const proposalId = Number(parsed.args[0]);
        if (proposalId > maxId) maxId = proposalId;
      }
      if (maxId >= 0) {
        addLog('info', `🔔 Detected newest ProposalSubmitted id=${maxId}`);
        await this.processProposal(maxId);
      }
    }
    this.lastBlock = toBlock;
  }

  async processProposal(proposalId) {
    try {
      const p = await proposalContract.getProposal(proposalId);
      const proposal = {
        id: Number(p.id),
        title: p.title,
        description: p.description,
        amount: parseFloat(ethers.utils.formatUnits(p.amount, AMOUNT_DECIMALS)),
        submitter: p.submitter,
        recipient: p.recipient,
        timestamp: Number(p.timestamp),
      };
      await this.evaluateProposal(proposal);
    } catch (e) {
      addLog('error', `processProposal(${proposalId}) failed: ${e.message}`);
    }
  }

  async evaluateProposal(proposal) {
    addLog('info', `\n📨 EVALUATING PROPOSAL ${proposal.id}`);
    addLog('info', `📝 "${proposal.title}"`);
    addLog('info', `💰 ${proposal.amount} cBTC`);

    this.proposals.set(proposal.id, proposal);
    const interested = [];

    for (const agent of this.agents) {
      const isInterested = await agent.evaluateProposalRelevance(proposal);
      if (isInterested) {
        addLog('info', `📈 ${agent.name} relevance > 6 → evaluating stake…`);
        const staked = await agent.registerForProposal(proposal.id);
        if (staked) interested.push(agent);
      }
    }

    this.proposalAgents.set(proposal.id, interested);
    addLog('info', `\n📊 INTERESTED (staked) AGENTS: ${interested.length}/${this.agents.length}`);
    interested.forEach(a => addLog('info', `   ✅ ${a.name} (${a.specialization})`));

    if (interested.length === 0) {
      addLog('warn', '   ⚠️ No agents staked on this proposal');
      return;
    }

    addLog('info', `\n🚀 BEGINNING ANALYSIS FOR PROPOSAL ${proposal.id}`);
    const analyses = await Promise.all(interested.map(a => a.analyzeProposal(proposal)));
    await this.consensus(proposal.id, analyses.filter(Boolean), interested);
  }

  async consensus(proposalId, analyses, agents) {
    addLog('info', `\n⚖️ CONSENSUS FOR PROPOSAL ${proposalId}`);
    if (analyses.length === 0) { addLog('error', '❌ No analyses'); return; }

    // Consider only non-neutral
    const considered = analyses.filter(a => a.recommendation !== 0);
    let approvalWeight = 0, totalWeight = 0;
    considered.forEach(a => {
      const w = a.confidence / 100;
      totalWeight += w;
      if (a.recommendation > 0) approvalWeight += w;
    });
    const approvalRate = totalWeight > 0 ? (approvalWeight / totalWeight) * 100 : 0;

    addLog('info', `📊 Total Analyses: ${analyses.length} | Considered (non-neutral): ${considered.length}`);
    addLog('info', `📊 Weighted Approval: ${approvalRate.toFixed(1)}%`);

    if (approvalRate >= 70) addLog('info', '✅ APPROVED — Treasury can execute (virtual)');
    else if (approvalRate <= 30) addLog('info', '❌ REJECTED — No payment');
    else addLog('warn', '⚠️ MIXED — Manual review');

    addLog('info', `\n🤖 Agent Decisions:`);
    analyses.forEach((a, i) => {
      const agent = agents[i];
      const decision = a.recommendation > 0 ? 'APPROVE' : a.recommendation < 0 ? 'REJECT' : 'NEUTRAL';
      addLog('info', `   ${agent.name}: ${decision} (${a.confidence}%)`);
    });
  }
}

const proposalManager = new ProposalManager();

/* ==============================
   BOOT
============================== */
async function main() {
  addLog('info', '🚀 Initializing agents…');
  proposalManager.agents.forEach(a => {
    const ai = a.groq ? 'real AI' : 'fallback';
    addLog('info', `✅ ${a.name} (${a.specialization}) — ${ai}`);
  });

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    addLog('info', `📡 REST server on http://localhost:${PORT}`);
    addLog('info', `   • Logs:   GET /logs`);
    addLog('info', `   • Status: GET /status`);
    addLog('info', `   • Demo:   GET /demo`);
    addLog('info', `   • Propose:POST /proposal`);
  });

  await proposalManager.startChainWatcher();
}
main().catch(e => addLog('error', `💥 boot error: ${e.message}`));
