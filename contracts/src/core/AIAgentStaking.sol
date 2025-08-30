// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IERC8004Messenger {
    enum MessageType {
        PROPOSAL_SUBMITTED,
        ANALYSIS_POSTED,
        CONSENSUS_UPDATE,
        EXECUTION_COMPLETE,
        CHALLENGE_POSTED,
        AGENT_SLASHED
    }
    
    function postMessage(
        uint256 proposalId,
        MessageType msgType,
        string memory content,
        string memory ipfsHash,
        bytes32 parentHash
    ) external;
}

/**
 * @title AIAgentStaking
 * @dev Staking contract for AI agents participating in governance
 * @notice Agents must stake native cBTC to participate in proposal analysis
 */
contract AIAgentStaking is Ownable, ReentrancyGuard, Pausable {
    
    // =============================================================================
    // CONSTANTS & VARIABLES
    // =============================================================================
    
    uint256 public constant MINIMUM_STAKE = 0.00001 ether; // 0.00001 cBTC
    uint256 public constant UNSTAKE_COOLDOWN = 7 days;
    uint256 public constant SLASH_COOLDOWN = 30 days;
    
    IERC8004Messenger public immutable erc8004Messenger;
    
    // Agent specialization types
    enum AgentType {
        RISK,       // 0 - Risk Assessment
        FINANCIAL,  // 1 - Financial Analysis  
        COMMUNITY,  // 2 - Community Impact
        TECHNICAL   // 3 - Technical Feasibility
    }
    
    // Agent information struct
    struct AgentInfo {
        bool isRegistered;
        AgentType agentType;
        uint256 stakedAmount;
        uint256 lastStakeTime;
        uint256 unstakeRequestTime;
        uint256 totalAnalyses;
        uint256 correctPredictions;
        uint256 accuracyScore; // Basis points (10000 = 100%)
        bool isSlashed;
        uint256 slashEndTime;
        string metadataURI; // IPFS hash for agent details
    }
    
    // Proposal analysis struct
    struct Analysis {
        address agent;
        uint256 proposalId;
        int8 recommendation; // -1 = reject, 0 = neutral, 1 = approve
        uint256 confidence; // Basis points (10000 = 100%)
        uint256 timestamp;
        string ipfsHash;
        bool verified;
    }
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    mapping(address => AgentInfo) public agents;
    mapping(uint256 => Analysis[]) public proposalAnalyses;
    mapping(uint256 => mapping(address => bool)) public hasAnalyzed;
    
    address[] public registeredAgents;
    uint256 public totalStaked;
    uint256 public rewardPool;
    
    // Performance tracking
    mapping(address => uint256[]) public agentProposalHistory;
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event AgentRegistered(address indexed agent, AgentType agentType, string metadataURI);
    event AgentStaked(address indexed agent, uint256 amount, uint256 totalStaked);
    event AgentUnstakeRequested(address indexed agent, uint256 requestTime);
    event AgentUnstaked(address indexed agent, uint256 amount);
    event AnalysisSubmitted(address indexed agent, uint256 indexed proposalId, int8 recommendation, uint256 confidence);
    event AgentSlashed(address indexed agent, uint256 amount, string reason);
    event AgentRewarded(address indexed agent, uint256 amount);
    event AccuracyUpdated(address indexed agent, uint256 newAccuracy);
    
    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================
    
    constructor(address _erc8004Messenger, address initialOwner) 
        Ownable(initialOwner) 
    {
        erc8004Messenger = IERC8004Messenger(_erc8004Messenger);
    }
    
    // =============================================================================
    // MODIFIERS
    // =============================================================================
    
    modifier onlyStakedAgent() {
        require(agents[msg.sender].isRegistered, "Agent not registered");
        require(agents[msg.sender].stakedAmount >= MINIMUM_STAKE, "Insufficient stake");
        require(!agents[msg.sender].isSlashed || block.timestamp > agents[msg.sender].slashEndTime, "Agent is slashed");
        _;
    }
    
    modifier validProposal(uint256 proposalId) {
        require(proposalId > 0, "Invalid proposal ID");
        _;
    }
    
    // =============================================================================
    // AGENT REGISTRATION & STAKING
    // =============================================================================
    
    /**
     * @dev Register as an AI agent and stake cBTC
     * @param agentType The specialization of this agent
     * @param metadataURI IPFS hash containing agent details
     */
    function stakeAsAgent(AgentType agentType, string calldata metadataURI) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value >= MINIMUM_STAKE, "Stake below minimum");
        require(!agents[msg.sender].isRegistered, "Agent already registered");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        agents[msg.sender] = AgentInfo({
            isRegistered: true,
            agentType: agentType,
            stakedAmount: msg.value,
            lastStakeTime: block.timestamp,
            unstakeRequestTime: 0,
            totalAnalyses: 0,
            correctPredictions: 0,
            accuracyScore: 5000, // Start at 50%
            isSlashed: false,
            slashEndTime: 0,
            metadataURI: metadataURI
        });
        
        registeredAgents.push(msg.sender);
        totalStaked += msg.value;
        
        emit AgentRegistered(msg.sender, agentType, metadataURI);
        emit AgentStaked(msg.sender, msg.value, agents[msg.sender].stakedAmount);
    }
    
    /**
     * @dev Add more stake to existing agent position
     */
    function addStake() 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(agents[msg.sender].isRegistered, "Agent not registered");
        require(msg.value > 0, "Must stake positive amount");
        require(agents[msg.sender].unstakeRequestTime == 0, "Unstake request pending");
        
        agents[msg.sender].stakedAmount += msg.value;
        agents[msg.sender].lastStakeTime = block.timestamp;
        totalStaked += msg.value;
        
        emit AgentStaked(msg.sender, msg.value, agents[msg.sender].stakedAmount);
    }
    
    /**
     * @dev Request to unstake (starts cooldown period)
     */
    function requestUnstake() 
        external 
        nonReentrant 
    {
        require(agents[msg.sender].isRegistered, "Agent not registered");
        require(agents[msg.sender].unstakeRequestTime == 0, "Unstake already requested");
        require(agents[msg.sender].stakedAmount > 0, "No stake to withdraw");
        
        agents[msg.sender].unstakeRequestTime = block.timestamp;
        
        emit AgentUnstakeRequested(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Complete unstaking after cooldown period
     */
    function unstake() 
        external 
        nonReentrant 
    {
        require(agents[msg.sender].isRegistered, "Agent not registered");
        require(agents[msg.sender].unstakeRequestTime > 0, "No unstake request");
        require(
            block.timestamp >= agents[msg.sender].unstakeRequestTime + UNSTAKE_COOLDOWN,
            "Cooldown period not complete"
        );
        
        uint256 amount = agents[msg.sender].stakedAmount;
        require(amount > 0, "No stake to withdraw");
        
        // Update state before transfer
        agents[msg.sender].stakedAmount = 0;
        agents[msg.sender].unstakeRequestTime = 0;
        agents[msg.sender].isRegistered = false;
        totalStaked -= amount;
        
        // Remove from registered agents array
        _removeFromRegisteredAgents(msg.sender);
        
        // Transfer cBTC
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit AgentUnstaked(msg.sender, amount);
    }
    
    // =============================================================================
    // ANALYSIS SUBMISSION
    // =============================================================================
    
    /**
     * @dev Submit analysis for a proposal
     * @param proposalId The proposal being analyzed
     * @param recommendation Agent's recommendation (-1, 0, 1)
     * @param confidence Confidence level in basis points (0-10000)
     * @param ipfsHash IPFS hash of detailed analysis
     */
    function submitAnalysis(
        uint256 proposalId,
        int8 recommendation,
        uint256 confidence,
        string calldata ipfsHash
    ) 
        external 
        onlyStakedAgent 
        validProposal(proposalId)
        nonReentrant 
        whenNotPaused 
    {
        require(recommendation >= -1 && recommendation <= 1, "Invalid recommendation");
        require(confidence <= 10000, "Confidence exceeds maximum");
        require(!hasAnalyzed[proposalId][msg.sender], "Already analyzed this proposal");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        // Create analysis record
        Analysis memory analysis = Analysis({
            agent: msg.sender,
            proposalId: proposalId,
            recommendation: recommendation,
            confidence: confidence,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash,
            verified: false
        });
        
        proposalAnalyses[proposalId].push(analysis);
        hasAnalyzed[proposalId][msg.sender] = true;
        agents[msg.sender].totalAnalyses++;
        agentProposalHistory[msg.sender].push(proposalId);
        
        // Post to ERC8004Messenger for transparency
        string memory content = string(abi.encodePacked(
            "Analysis: ", 
            recommendation == 1 ? "APPROVE" : recommendation == -1 ? "REJECT" : "NEUTRAL",
            " | Confidence: ", _toString(confidence / 100), "% | IPFS: ", ipfsHash
        ));
        
        erc8004Messenger.postMessage(
            proposalId,
            IERC8004Messenger.MessageType.ANALYSIS_POSTED,
            content,
            ipfsHash, // Use the analysis IPFS hash
            bytes32(0) // No parent for agent analyses
        );
        
        emit AnalysisSubmitted(msg.sender, proposalId, recommendation, confidence);
    }
    
    // =============================================================================
    // PERFORMANCE & REWARDS
    // =============================================================================
    
    /**
     * @dev Update agent accuracy based on proposal outcome
     * @param proposalId The completed proposal
     * @param actualOutcome The actual result (1 = approved, -1 = rejected)
     */
    function updateAgentAccuracy(uint256 proposalId, int8 actualOutcome) 
        external 
        onlyOwner 
    {
        require(actualOutcome == 1 || actualOutcome == -1, "Invalid outcome");
        
        Analysis[] memory analyses = proposalAnalyses[proposalId];
        
        for (uint256 i = 0; i < analyses.length; i++) {
            Analysis storage analysis = proposalAnalyses[proposalId][i];
            address agent = analysis.agent;
            
            if (!agents[agent].isRegistered) continue;
            
            // Mark as verified
            analysis.verified = true;
            
            // Check if prediction was correct
            bool isCorrect = (analysis.recommendation == actualOutcome) || 
                           (analysis.recommendation == 0); // Neutral is always "safe"
            
            if (isCorrect) {
                agents[agent].correctPredictions++;
            }
            
            // Update accuracy score (weighted moving average)
            uint256 newAccuracy = (agents[agent].correctPredictions * 10000) / agents[agent].totalAnalyses;
            agents[agent].accuracyScore = newAccuracy;
            
            emit AccuracyUpdated(agent, newAccuracy);
        }
    }
    
    /**
     * @dev Reward agent for accurate analysis
     */
    function rewardAgent(address agent, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(agents[agent].isRegistered, "Agent not registered");
        require(amount <= rewardPool, "Insufficient reward pool");
        
        rewardPool -= amount;
        
        (bool success, ) = payable(agent).call{value: amount}("");
        require(success, "Reward transfer failed");
        
        emit AgentRewarded(agent, amount);
    }
    
    /**
     * @dev Slash agent for malicious behavior
     */
    function slashAgent(address agent, uint256 slashAmount, string calldata reason) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(agents[agent].isRegistered, "Agent not registered");
        require(slashAmount <= agents[agent].stakedAmount, "Slash exceeds stake");
        
        agents[agent].stakedAmount -= slashAmount;
        agents[agent].isSlashed = true;
        agents[agent].slashEndTime = block.timestamp + SLASH_COOLDOWN;
        totalStaked -= slashAmount;
        rewardPool += slashAmount; // Slashed funds go to reward pool
        
        emit AgentSlashed(agent, slashAmount, reason);
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Check if address is authorized to post messages
     */
    function isAuthorizedAgent(address agent) external view returns (bool) {
        return agents[agent].isRegistered && 
               agents[agent].stakedAmount >= MINIMUM_STAKE &&
               (!agents[agent].isSlashed || block.timestamp > agents[agent].slashEndTime);
    }
    
    /**
     * @dev Get agent information
     */
    function getAgentInfo(address agent) external view returns (AgentInfo memory) {
        return agents[agent];
    }
    
    /**
     * @dev Get all analyses for a proposal
     */
    function getProposalAnalyses(uint256 proposalId) external view returns (Analysis[] memory) {
        return proposalAnalyses[proposalId];
    }
    
    /**
     * @dev Get agent's analysis history
     */
    function getAgentHistory(address agent) external view returns (uint256[] memory) {
        return agentProposalHistory[agent];
    }
    
    /**
     * @dev Get total number of registered agents
     */
    function getRegisteredAgentsCount() external view returns (uint256) {
        return registeredAgents.length;
    }
    
    /**
     * @dev Get agent by index
     */
    function getAgentByIndex(uint256 index) external view returns (address) {
        require(index < registeredAgents.length, "Index out of bounds");
        return registeredAgents[index];
    }
    
    /**
     * @dev Calculate agent influence weight based on stake and accuracy
     */
    function getAgentWeight(address agent) external view returns (uint256) {
        if (!agents[agent].isRegistered || agents[agent].stakedAmount < MINIMUM_STAKE) {
            return 0;
        }
        
        uint256 stakeWeight = agents[agent].stakedAmount;
        uint256 accuracyMultiplier = agents[agent].accuracyScore; // Already in basis points
        
        // Weight = stake * (accuracy / 100) 
        // This gives more weight to both higher stakes and higher accuracy
        return (stakeWeight * accuracyMultiplier) / 10000;
    }
    
    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Add funds to reward pool
     */
    function addToRewardPool() external payable onlyOwner {
        rewardPool += msg.value;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only if paused)
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }
    
    // =============================================================================
    // INTERNAL FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Remove agent from registered agents array
     */
    function _removeFromRegisteredAgents(address agent) internal {
        for (uint256 i = 0; i < registeredAgents.length; i++) {
            if (registeredAgents[i] == agent) {
                registeredAgents[i] = registeredAgents[registeredAgents.length - 1];
                registeredAgents.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // =============================================================================
    // RECEIVE FUNCTION
    // =============================================================================
    
    /**
     * @dev Accept cBTC deposits for reward pool
     */
    receive() external payable {
        rewardPool += msg.value;
    }
}