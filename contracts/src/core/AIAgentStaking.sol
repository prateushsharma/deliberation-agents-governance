// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AIAgentStaking - Remix Ready Version
 * @dev Manages AI agent participation and economic incentives for governance
 */
contract AIAgentStaking {
    // =============== STATE VARIABLES ===============
    
    address public messenger;
    address public owner;
    uint256 public minimumStake = 0.00001 ether; // 0.00001 cBTC minimum
    
    struct Agent {
        bool isRegistered;
        uint256 totalStaked;
        uint256 successfulAnalyses;
        uint256 totalAnalyses;
        string specialization;
        string ipfsProfile;
    }
    
    struct AgentAnalysis {
        int8 recommendation; // -1: reject, 0: neutral, 1: approve
        uint256 confidence; // 0-100
        uint256 stakeAmount; // Amount staked for this analysis
        string ipfsHash; // Detailed analysis on IPFS
        uint256 timestamp;
        bool submitted;
    }
    
    mapping(address => Agent) public agents;
    mapping(uint256 => mapping(address => AgentAnalysis)) public agentAnalyses;
    mapping(address => uint256) public agentStakes;
    address[] public registeredAgents;
    
    // Track which agents participated in each proposal
    mapping(uint256 => address[]) public proposalAgents;
    mapping(uint256 => mapping(address => bool)) public hasSubmittedAnalysis;
    
    // Authorization for ConsensusEngine
    mapping(address => bool) public authorizedConsensus;
    
    // =============== EVENTS ===============
    
    event AgentRegistered(address indexed agent, uint256 stakeAmount, string specialization);
    event AnalysisSubmitted(
        uint256 indexed proposalId, 
        address indexed agent, 
        int8 recommendation, 
        uint256 confidence,
        string ipfsHash
    );
    event AgentSlashed(address indexed agent, uint256 amount, string reason);
    event AgentRewarded(address indexed agent, uint256 amount);
    event ConsensusEngineAuthorized(address indexed consensusEngine);
    
    // =============== CONSTRUCTOR ===============
    
    constructor(address _messenger) {
        messenger = _messenger;
        owner = msg.sender;
    }
    
    // =============== MODIFIERS ===============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyRegisteredAgent() {
        require(agents[msg.sender].isRegistered, "Agent not registered");
        _;
    }
    
    // =============== CORE FUNCTIONS ===============
    
    /**
     * @dev Register as an AI agent with minimum stake
     */
    function registerAgent(
        string calldata specialization,
        string calldata ipfsProfile
    ) external payable {
        require(msg.value >= minimumStake, "Insufficient stake");
        require(!agents[msg.sender].isRegistered, "Agent already registered");
        require(bytes(specialization).length > 0, "Specialization required");
        
        agents[msg.sender] = Agent({
            isRegistered: true,
            totalStaked: msg.value,
            successfulAnalyses: 0,
            totalAnalyses: 0,
            specialization: specialization,
            ipfsProfile: ipfsProfile
        });
        
        agentStakes[msg.sender] = msg.value;
        registeredAgents.push(msg.sender);
        
        emit AgentRegistered(msg.sender, msg.value, specialization);
    }
    
    /**
     * @dev Add more stake to increase influence
     */
    function addStake() external payable onlyRegisteredAgent {
        require(msg.value > 0, "Must stake something");
        
        agents[msg.sender].totalStaked += msg.value;
        agentStakes[msg.sender] += msg.value;
    }
    
    /**
     * @dev Submit analysis for a proposal
     */
    function submitAnalysis(
        uint256 proposalId,
        int8 recommendation,
        uint256 confidence,
        string calldata ipfsHash
    ) external onlyRegisteredAgent {
        require(proposalId > 0, "Invalid proposal ID");
        require(recommendation >= -1 && recommendation <= 1, "Invalid recommendation");
        require(confidence <= 100, "Invalid confidence score");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(!agentAnalyses[proposalId][msg.sender].submitted, "Analysis already submitted");
        require(agentStakes[msg.sender] >= minimumStake, "Insufficient stake");
        
        // Store analysis
        agentAnalyses[proposalId][msg.sender] = AgentAnalysis({
            recommendation: recommendation,
            confidence: confidence,
            stakeAmount: agentStakes[msg.sender], // Current stake at time of analysis
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            submitted: true
        });
        
        // Track agent for this proposal
        if (!hasSubmittedAnalysis[proposalId][msg.sender]) {
            proposalAgents[proposalId].push(msg.sender);
            hasSubmittedAnalysis[proposalId][msg.sender] = true;
        }
        
        // Update agent stats
        agents[msg.sender].totalAnalyses++;
        
        // Try to post analysis to messenger (with error handling)
        if (messenger != address(0)) {
            try this.postAnalysisToMessenger(proposalId, msg.sender, recommendation, confidence) {
                // Success
            } catch {
                // Continue even if messaging fails
            }
        }
        
        emit AnalysisSubmitted(proposalId, msg.sender, recommendation, confidence, ipfsHash);
    }
    
    /**
     * @dev External function to post analysis to messenger (for try-catch)
     */
    function postAnalysisToMessenger(
        uint256 proposalId,
        address agent,
        int8 recommendation,
        uint256 confidence
    ) external {
        require(msg.sender == address(this), "Internal only");
        
        string memory analysisMessage = string(abi.encodePacked(
            agents[agent].specialization,
            " Agent: ",
            recommendation == 1 ? "APPROVE" : recommendation == -1 ? "REJECT" : "NEUTRAL",
            " (", toString(confidence), "% confidence)"
        ));
        
        // Call external messenger contract
        (bool success, ) = messenger.call(
            abi.encodeWithSignature(
                "postMessage(uint256,uint8,string,string)",
                proposalId,
                1, // ANALYSIS_POSTED message type
                analysisMessage,
                ""
            )
        );
        
        // Don't revert if messenger call fails
    }
    
    // =============== CONSENSUS ENGINE INTEGRATION ===============
    
    /**
     * @dev Get all agents who submitted analysis for a proposal
     * Required by ConsensusEngine to calculate consensus
     */
    function getProposalAgents(uint256 proposalId) 
        external 
        view 
        returns (address[] memory) 
    {
        return proposalAgents[proposalId];
    }
    
    /**
     * @dev Get detailed analysis from specific agent for proposal
     * Required by ConsensusEngine for weighted voting
     */
    function getAgentAnalysis(uint256 proposalId, address agent)
        external
        view
        returns (
            int8 recommendation,
            uint256 confidence,
            uint256 stakeAmount,
            string memory ipfsHash,
            uint256 timestamp
        )
    {
        AgentAnalysis storage analysis = agentAnalyses[proposalId][agent];
        return (
            analysis.recommendation,
            analysis.confidence,
            analysis.stakeAmount,
            analysis.ipfsHash,
            analysis.timestamp
        );
    }
    
    /**
     * @dev Set authorized consensus engine (only owner)
     */
    function setAuthorizedConsensus(address consensusEngine) external onlyOwner {
        require(consensusEngine != address(0), "Invalid consensus engine address");
        authorizedConsensus[consensusEngine] = true;
        emit ConsensusEngineAuthorized(consensusEngine);
    }
    
    /**
     * @dev Get number of agents who analyzed a proposal
     */
    function getProposalAgentCount(uint256 proposalId) external view returns (uint256) {
        return proposalAgents[proposalId].length;
    }
    
    /**
     * @dev Check if agent has submitted analysis for proposal
     */
    function hasAgentAnalyzed(uint256 proposalId, address agent) external view returns (bool) {
        return hasSubmittedAnalysis[proposalId][agent];
    }
    
    /**
     * @dev Get all analyses for a proposal (for frontend)
     */
    function getProposalAnalyses(uint256 proposalId) 
        external 
        view 
        returns (
            address[] memory agentAddresses,
            int8[] memory recommendations,
            uint256[] memory confidences,
            string[] memory specializations
        ) 
    {
        address[] memory agents_list = proposalAgents[proposalId];
        uint256 count = agents_list.length;
        
        agentAddresses = new address[](count);
        recommendations = new int8[](count);
        confidences = new uint256[](count);
        specializations = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            address agent = agents_list[i];
            AgentAnalysis storage analysis = agentAnalyses[proposalId][agent];
            
            agentAddresses[i] = agent;
            recommendations[i] = analysis.recommendation;
            confidences[i] = analysis.confidence;
            specializations[i] = agents[agent].specialization;
        }
        
        return (agentAddresses, recommendations, confidences, specializations);
    }
    
    // =============== AGENT MANAGEMENT ===============
    
    /**
     * @dev Slash an agent for poor performance
     */
    function slashAgent(
        address agent,
        uint256 amount,
        string calldata reason
    ) external onlyOwner {
        require(agents[agent].isRegistered, "Agent not registered");
        require(agentStakes[agent] >= amount, "Insufficient stake to slash");
        
        agentStakes[agent] -= amount;
        agents[agent].totalStaked -= amount;
        
        emit AgentSlashed(agent, amount, reason);
    }
    
    /**
     * @dev Reward an agent for accurate analysis
     */
    function rewardAgent(address agent) external payable onlyOwner {
        require(agents[agent].isRegistered, "Agent not registered");
        require(msg.value > 0, "No reward sent");
        
        agents[agent].successfulAnalyses++;
        
        (bool success, ) = agent.call{value: msg.value}("");
        require(success, "Reward transfer failed");
        
        emit AgentRewarded(agent, msg.value);
    }
    
    // =============== VIEW FUNCTIONS ===============
    
    /**
     * @dev Get agent information
     */
    function getAgent(address agentAddress) external view returns (
        bool isRegistered,
        uint256 totalStaked,
        uint256 successfulAnalyses,
        uint256 totalAnalyses,
        string memory specialization,
        string memory ipfsProfile
    ) {
        Agent storage agent = agents[agentAddress];
        return (
            agent.isRegistered,
            agent.totalStaked,
            agent.successfulAnalyses,
            agent.totalAnalyses,
            agent.specialization,
            agent.ipfsProfile
        );
    }
    
    /**
     * @dev Get all registered agents
     */
    function getAllAgents() external view returns (address[] memory) {
        return registeredAgents;
    }
    
    /**
     * @dev Get agent's success rate
     */
    function getAgentSuccessRate(address agentAddress) external view returns (uint256) {
        Agent storage agent = agents[agentAddress];
        if (agent.totalAnalyses == 0) return 0;
        return (agent.successfulAnalyses * 10000) / agent.totalAnalyses; // In basis points
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // =============== ADMIN FUNCTIONS ===============
    
    /**
     * @dev Update minimum stake requirement
     */
    function updateMinimumStake(uint256 newMinimum) external onlyOwner {
        minimumStake = newMinimum;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    // =============== UTILITY FUNCTIONS ===============
    
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
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
    
    // Allow contract to receive cBTC
    receive() external payable {}
}