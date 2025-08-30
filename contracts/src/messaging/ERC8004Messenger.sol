// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ERC8004Messenger
 * @dev Transparent messaging system for governance audit trails
 * @notice All AI agent decisions, consensus updates, and executions are recorded here
 */
contract ERC8004Messenger {
    
    // Message types for different governance events
    enum MessageType {
        PROPOSAL_SUBMITTED,    // New proposal created
        ANALYSIS_POSTED,       // AI agent posts analysis
        CONSENSUS_UPDATE,      // Consensus percentage changes
        EXECUTION_COMPLETE,    // Payment executed
        CHALLENGE_POSTED,      // Community challenge to decision
        AGENT_SLASHED         // Agent penalized for wrong decision
    }
    
    // Core message structure
    struct Message {
        uint256 id;            // Unique message ID
        uint256 proposalId;    // Which proposal this relates to
        address sender;        // Who posted this message
        MessageType msgType;   // Type of message
        string content;        // Human-readable content
        string ipfsHash;       // Extended data on IPFS
        uint256 timestamp;     // When message was posted
        bytes32 parentHash;    // For threading/replies
        uint256 blockNumber;   // Block number for verification
    }
    
    // Storage
    mapping(uint256 => Message[]) public proposalThreads;  // proposalId => Message[]
    mapping(uint256 => Message) public messages;           // messageId => Message
    mapping(address => bool) public authorizedPosters;     // Who can post messages
    
    uint256 public nextMessageId = 1;
    address public governance;
    
    // Events
    event MessagePosted(
        uint256 indexed messageId,
        uint256 indexed proposalId, 
        address indexed sender,
        MessageType msgType,
        string content
    );
    
    event AuthorizationChanged(address indexed poster, bool authorized);
    
    modifier onlyAuthorized() {
        require(authorizedPosters[msg.sender] || msg.sender == governance, "Not authorized to post");
        _;
    }
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance");
        _;
    }
    
    constructor() {
        governance = msg.sender;
        authorizedPosters[msg.sender] = true;
    }
    
    /**
     * @dev Post a new message to a proposal thread
     * @param proposalId Which proposal this message relates to
     * @param msgType Type of message being posted
     * @param content Human-readable content
     * @param ipfsHash Hash of extended data stored on IPFS
     * @param parentHash Hash of parent message (for threading)
     */
    function postMessage(
        uint256 proposalId,
        MessageType msgType,
        string memory content,
        string memory ipfsHash,
        bytes32 parentHash
    ) external onlyAuthorized returns (uint256 messageId) {
        messageId = nextMessageId++;
        
        Message memory newMessage = Message({
            id: messageId,
            proposalId: proposalId,
            sender: msg.sender,
            msgType: msgType,
            content: content,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            parentHash: parentHash,
            blockNumber: block.number
        });
        
        // Store message
        messages[messageId] = newMessage;
        proposalThreads[proposalId].push(newMessage);
        
        emit MessagePosted(messageId, proposalId, msg.sender, msgType, content);
        
        return messageId;
    }
    
    /**
     * @dev Get all messages for a specific proposal
     * @param proposalId The proposal ID to get thread for
     * @return Array of messages in chronological order
     */
    function getProposalThread(uint256 proposalId) external view returns (Message[] memory) {
        return proposalThreads[proposalId];
    }
    
    /**
     * @dev Get a specific message by ID
     * @param messageId The message ID
     * @return The message struct
     */
    function getMessage(uint256 messageId) external view returns (Message memory) {
        return messages[messageId];
    }
    
    /**
     * @dev Get the latest N messages for a proposal
     * @param proposalId The proposal ID
     * @param count Number of recent messages to return
     * @return Array of most recent messages
     */
    function getLatestMessages(uint256 proposalId, uint256 count) 
        external view returns (Message[] memory) {
        Message[] storage thread = proposalThreads[proposalId];
        uint256 threadLength = thread.length;
        
        if (threadLength == 0) {
            return new Message[](0);
        }
        
        uint256 returnCount = count > threadLength ? threadLength : count;
        Message[] memory latestMessages = new Message[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            latestMessages[i] = thread[threadLength - returnCount + i];
        }
        
        return latestMessages;
    }
    
    /**
     * @dev Get messages of specific type for a proposal
     * @param proposalId The proposal ID
     * @param msgType The message type to filter by
     * @return Array of messages matching the type
     */
    function getMessagesByType(uint256 proposalId, MessageType msgType) 
        external view returns (Message[] memory) {
        Message[] storage thread = proposalThreads[proposalId];
        
        // Count matching messages first
        uint256 matchingCount = 0;
        for (uint256 i = 0; i < thread.length; i++) {
            if (thread[i].msgType == msgType) {
                matchingCount++;
            }
        }
        
        // Create array and populate
        Message[] memory matchingMessages = new Message[](matchingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < thread.length; i++) {
            if (thread[i].msgType == msgType) {
                matchingMessages[currentIndex] = thread[i];
                currentIndex++;
            }
        }
        
        return matchingMessages;
    }
    
    /**
     * @dev Get thread statistics
     * @param proposalId The proposal ID
     * @return totalMessages Total number of messages
     * @return uniquePosters Number of unique message posters
     * @return lastActivity Timestamp of last message
     */
    function getThreadStats(uint256 proposalId) 
        external view returns (uint256 totalMessages, uint256 uniquePosters, uint256 lastActivity) {
        Message[] storage thread = proposalThreads[proposalId];
        totalMessages = thread.length;
        
        if (totalMessages == 0) {
            return (0, 0, 0);
        }
        
        // Count unique posters
        address[] memory posters = new address[](totalMessages);
        uint256 uniqueCount = 0;
        
        for (uint256 i = 0; i < totalMessages; i++) {
            address poster = thread[i].sender;
            bool isUnique = true;
            
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (posters[j] == poster) {
                    isUnique = false;
                    break;
                }
            }
            
            if (isUnique) {
                posters[uniqueCount] = poster;
                uniqueCount++;
            }
        }
        
        uniquePosters = uniqueCount;
        lastActivity = thread[totalMessages - 1].timestamp;
    }
    
    /**
     * @dev Authorize or deauthorize an address to post messages
     * @param poster Address to authorize/deauthorize
     * @param authorized True to authorize, false to deauthorize
     */
    function setAuthorization(address poster, bool authorized) external onlyGovernance {
        authorizedPosters[poster] = authorized;
        emit AuthorizationChanged(poster, authorized);
    }
    
    /**
     * @dev Batch authorize multiple addresses
     * @param posters Array of addresses to authorize
     */
    function batchAuthorize(address[] calldata posters) external onlyGovernance {
        for (uint256 i = 0; i < posters.length; i++) {
            authorizedPosters[posters[i]] = true;
            emit AuthorizationChanged(posters[i], true);
        }
    }
    
    /**
     * @dev Transfer governance to new address
     * @param newGovernance New governance address
     */
    function transferGovernance(address newGovernance) external onlyGovernance {
        require(newGovernance != address(0), "Invalid governance address");
        governance = newGovernance;
        authorizedPosters[newGovernance] = true;
    }
    
    /**
     * @dev Emergency function to clear a proposal thread (governance only)
     * @param proposalId Proposal ID to clear
     */
    function emergencyClearThread(uint256 proposalId) external onlyGovernance {
        delete proposalThreads[proposalId];
    }
    
    /**
     * @dev View function to check if address can post
     * @param poster Address to check
     * @return True if authorized to post
     */
    function canPost(address poster) external view returns (bool) {
        return authorizedPosters[poster] || poster == governance;
    }
}