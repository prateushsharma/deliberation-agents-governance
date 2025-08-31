// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ConsensusEngine - Minimal Version (Guaranteed to compile)
 * @dev The autonomous governance brain - minimal functions to avoid stack issues
 */
contract ConsensusEngine {
    // =============== STATE VARIABLES ===============
    
    address public agentStaking;
    address public messenger;
    address public treasury;
    address public owner;
    
    uint256 public constant APPROVAL_THRESHOLD = 7000; // 70%
    uint256 public constant CHALLENGE_PERIOD = 24 hours;
    
    enum ProposalState {
        Analyzing,
        Challenging,
        Approved,
        Rejected,
        Executed,
        Challenged
    }
    
    struct ConsensusData {
        uint256 proposalId;
        uint256 totalApprovalWeight;
        uint256 totalRejectionWeight;
        uint256 totalStakedWeight;
        uint256 consensusReachedAt;
        uint256 challengeDeadline;
        ProposalState state;
        int8 finalDecision;
        bool executed;
        address recipient;
        uint256 amount;
        uint256 participatingAgents;
    }
    
    struct AgentAnalysis {
        int8 recommendation;
        uint256 confidence;
        uint256 stakeAmount;
        uint256 timestamp;
        bool submitted;
    }
    
    mapping(uint256 => ConsensusData) public consensusData;
    mapping(uint256 => address[]) public proposalAgents;
    mapping(uint256 => mapping(address => AgentAnalysis)) public agentAnalyses;
    mapping(address => uint256) public agentAccuracyScores;
    
    // =============== EVENTS ===============
    
    event ConsensusCalculated(uint256 indexed proposalId, uint256 approvalWeight, int8 decision);
    event PaymentExecuted(uint256 indexed proposalId, address recipient, uint256 amount);
    event AgentAnalysisAdded(uint256 indexed proposalId, address indexed agent, int8 recommendation);
    
    // =============== CONSTRUCTOR ===============
    
    constructor(address _agentStaking, address _messenger, address _treasury) {
        agentStaking = _agentStaking;
        messenger = _messenger;
        treasury = _treasury;
        owner = msg.sender;
        
        // Initialize demo agent accuracy scores
        agentAccuracyScores[0x1111111111111111111111111111111111111111] = 8500;
        agentAccuracyScores[0x2222222222222222222222222222222222222222] = 9200;
        agentAccuracyScores[0x3333333333333333333333333333333333333333] = 7800;
        agentAccuracyScores[0x4444444444444444444444444444444444444444] = 8900;
    }
    
    // =============== CORE FUNCTIONS ===============
    
    /**
     * @dev Add agent analysis (simplified)
     */
    function addAgentAnalysis(
        uint256 proposalId,
        address agent,
        int8 recommendation,
        uint256 confidence,
        uint256 stakeAmount
    ) external {
        require(msg.sender == owner || msg.sender == agent, "Unauthorized");
        require(recommendation >= -1 && recommendation <= 1, "Invalid recommendation");
        require(!agentAnalyses[proposalId][agent].submitted, "Already submitted");
        
        // Add agent to list if not exists
        bool exists = false;
        for (uint256 i = 0; i < proposalAgents[proposalId].length; i++) {
            if (proposalAgents[proposalId][i] == agent) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            proposalAgents[proposalId].push(agent);
        }
        
        // Store analysis
        agentAnalyses[proposalId][agent] = AgentAnalysis({
            recommendation: recommendation,
            confidence: confidence,
            stakeAmount: stakeAmount > 0 ? stakeAmount : 0.00001 ether,
            timestamp: block.timestamp,
            submitted: true
        });
        
        emit AgentAnalysisAdded(proposalId, agent, recommendation);
    }
    
    /**
     * @dev Calculate weighted consensus (simplified)
     */
    function calculateConsensus(uint256 proposalId) external {
        require(consensusData[proposalId].state == ProposalState.Analyzing, "Not analyzing");
        require(proposalAgents[proposalId].length >= 2, "Need 2+ analyses");
        
        uint256 totalApprovalWeight = 0;
        uint256 totalRejectionWeight = 0;
        uint256 totalWeight = 0;
        uint256 agentCount = 0;
        
        // Process each agent
        for (uint256 i = 0; i < proposalAgents[proposalId].length; i++) {
            address agent = proposalAgents[proposalId][i];
            AgentAnalysis storage analysis = agentAnalyses[proposalId][agent];
            
            if (!analysis.submitted) continue;
            
            uint256 weight = _calculateWeight(agent, analysis.stakeAmount, analysis.confidence);
            totalWeight += weight;
            agentCount++;
            
            if (analysis.recommendation == 1) {
                totalApprovalWeight += weight;
            } else if (analysis.recommendation == -1) {
                totalRejectionWeight += weight;
            }
        }
        
        // Store results
        ConsensusData storage consensus = consensusData[proposalId];
        consensus.proposalId = proposalId;
        consensus.totalApprovalWeight = totalApprovalWeight;
        consensus.totalRejectionWeight = totalRejectionWeight;
        consensus.totalStakedWeight = totalWeight;
        consensus.participatingAgents = agentCount;
        
        // Determine decision
        uint256 approvalPercentage = totalWeight > 0 ? (totalApprovalWeight * 10000) / totalWeight : 0;
        
        if (approvalPercentage >= APPROVAL_THRESHOLD) {
            consensus.finalDecision = 1;
            consensus.state = ProposalState.Challenging;
            consensus.challengeDeadline = block.timestamp + CHALLENGE_PERIOD;
        } else {
            consensus.finalDecision = -1;
            consensus.state = ProposalState.Challenging;
            consensus.challengeDeadline = block.timestamp + CHALLENGE_PERIOD;
        }
        
        emit ConsensusCalculated(proposalId, totalApprovalWeight, consensus.finalDecision);
    }
    
    /**
     * @dev Calculate agent weight (internal)
     */
    function _calculateWeight(address agent, uint256 stakeAmount, uint256 confidence) 
        internal view returns (uint256) 
    {
        uint256 baseWeight = stakeAmount;
        uint256 accuracyScore = agentAccuracyScores[agent];
        if (accuracyScore == 0) accuracyScore = 7500;
        
        uint256 accuracyMultiplier = (accuracyScore * 200) / 10000; // Max 2x
        if (accuracyMultiplier < 50) accuracyMultiplier = 50; // Min 0.5x
        
        uint256 confidenceMultiplier = 100 + (confidence * 900 / 100);
        
        return (baseWeight * accuracyMultiplier * confidenceMultiplier) / (100 * 1000);
    }
    
    /**
     * @dev Execute proposal after consensus
     */
    function executeIfConsensus(uint256 proposalId) external {
        ConsensusData storage consensus = consensusData[proposalId];
        
        require(consensus.state == ProposalState.Challenging, "Not challenging");
        require(block.timestamp >= consensus.challengeDeadline, "Challenge period active");
        require(!consensus.executed, "Already executed");
        
        if (consensus.finalDecision == 1 && consensus.amount > 0 && consensus.recipient != address(0)) {
            require(address(this).balance >= consensus.amount, "Insufficient funds");
            
            (bool success, ) = consensus.recipient.call{value: consensus.amount}("");
            require(success, "Payment failed");
            
            consensus.state = ProposalState.Executed;
            emit PaymentExecuted(proposalId, consensus.recipient, consensus.amount);
        } else {
            consensus.state = ProposalState.Rejected;
        }
        
        consensus.executed = true;
    }
    
    // =============== ADMIN FUNCTIONS ===============
    
    function setProposalPayment(uint256 proposalId, address recipient, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        consensusData[proposalId].recipient = recipient;
        consensusData[proposalId].amount = amount;
    }
    
    function skipChallengePeriod(uint256 proposalId) external {
        require(msg.sender == owner, "Only owner");
        consensusData[proposalId].challengeDeadline = block.timestamp;
    }
    
    function setupDemoProposal(uint256 proposalId, address recipient, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        
        consensusData[proposalId].recipient = recipient;
        consensusData[proposalId].amount = amount;
        
        // Add 4 demo agents
        address[4] memory agents = [
            0x1111111111111111111111111111111111111111,
            0x2222222222222222222222222222222222222222,
            0x3333333333333333333333333333333333333333,
            0x4444444444444444444444444444444444444444
        ];
        
        int8[4] memory recommendations = [int8(1), int8(1), int8(1), int8(0)]; // 3 approve, 1 neutral
        uint256[4] memory confidences = [uint256(85), uint256(92), uint256(78), uint256(71)];
        
        for (uint256 i = 0; i < 4; i++) {
            proposalAgents[proposalId].push(agents[i]);
            agentAnalyses[proposalId][agents[i]] = AgentAnalysis({
                recommendation: recommendations[i],
                confidence: confidences[i],
                stakeAmount: 0.00001 ether + i * 0.000005 ether,
                timestamp: block.timestamp,
                submitted: true
            });
        }
    }
    
    function depositToTreasury() external payable {
        require(msg.value > 0, "Must deposit something");
    }
    
    // =============== VIEW FUNCTIONS ===============
    
    function getConsensusState(uint256 proposalId) external view returns (
        uint256 approvalWeight,
        uint256 totalWeight,
        uint256 approvalPercentage,
        ProposalState state,
        int8 finalDecision,
        bool executed
    ) {
        ConsensusData storage consensus = consensusData[proposalId];
        uint256 approvalPct = consensus.totalStakedWeight > 0 ? 
            (consensus.totalApprovalWeight * 10000) / consensus.totalStakedWeight : 0;
        
        return (
            consensus.totalApprovalWeight,
            consensus.totalStakedWeight,
            approvalPct,
            consensus.state,
            consensus.finalDecision,
            consensus.executed
        );
    }
    
    function canExecute(uint256 proposalId) external view returns (bool) {
        ConsensusData storage consensus = consensusData[proposalId];
        return consensus.state == ProposalState.Challenging &&
               block.timestamp >= consensus.challengeDeadline &&
               !consensus.executed;
    }
    
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getProposalAgents(uint256 proposalId) external view returns (address[] memory) {
        return proposalAgents[proposalId];
    }
    
    receive() external payable {}
}