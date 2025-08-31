// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ERC8004Messenger - Simple Standalone Version
 * @dev Implements ERC-8004 for transparent AI governance communications
 */
contract ERC8004Messenger {
    // =============== STATE VARIABLES ===============
    
    struct Message {
        uint256 id;
        uint256 conversationId;
        address sender;
        uint8 messageType;
        string content;
        string parentHash;
        uint256 timestamp;
        bytes32 messageHash;
    }
    
    address public owner;
    uint256 public messageCounter;
    
    // Conversation ID -> Array of messages
    mapping(uint256 => Message[]) public conversations;
    
    // Authorization for contracts to post messages
    mapping(address => bool) public authorizedPosters;
    
    // Anti-spam measures
    mapping(address => uint256) public userMessageCount;
    mapping(address => uint256) public lastMessageTime;
    uint256 public constant MESSAGE_COOLDOWN = 30 seconds;
    uint256 public constant MAX_MESSAGES_PER_DAY = 100;
    
    // =============== EVENTS ===============
    
    event MessagePosted(
        uint256 indexed conversationId,
        uint256 indexed messageId,
        address indexed sender,
        uint8 messageType,
        bytes32 messageHash
    );
    
    event AuthorizedPosterSet(address indexed poster, bool authorized);
    
    // =============== CONSTRUCTOR ===============
    
    constructor() {
        owner = msg.sender;
    }
    
    // =============== MODIFIERS ===============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier rateLimited() {
        // Skip rate limiting for authorized contracts
        if (!authorizedPosters[msg.sender]) {
            require(
                block.timestamp >= lastMessageTime[msg.sender] + MESSAGE_COOLDOWN,
                "Message cooldown period not met"
            );
            require(
                userMessageCount[msg.sender] < MAX_MESSAGES_PER_DAY,
                "Daily message limit exceeded"
            );
            
            lastMessageTime[msg.sender] = block.timestamp;
            userMessageCount[msg.sender]++;
        }
        _;
    }
    
    // =============== CORE FUNCTIONS ===============
    
    /**
     * @dev Post a message to a conversation
     */
    function postMessage(
        uint256 conversationId,
        uint8 messageType,
        string calldata content,
        string calldata parentHash
    ) external rateLimited {
        require(conversationId > 0, "Invalid conversation ID");
        require(bytes(content).length > 0, "Content cannot be empty");
        require(bytes(content).length <= 2000, "Content too long");
        require(messageType <= 5, "Invalid message type");
        
        // Create message hash for integrity
        bytes32 messageHash = keccak256(abi.encodePacked(
            conversationId,
            msg.sender,
            messageType,
            content,
            parentHash,
            block.timestamp
        ));
        
        // Create message
        Message memory newMessage = Message({
            id: messageCounter,
            conversationId: conversationId,
            sender: msg.sender,
            messageType: messageType,
            content: content,
            parentHash: parentHash,
            timestamp: block.timestamp,
            messageHash: messageHash
        });
        
        // Store message
        conversations[conversationId].push(newMessage);
        messageCounter++;
        
        emit MessagePosted(
            conversationId,
            newMessage.id,
            msg.sender,
            messageType,
            messageHash
        );
    }
    
    /**
     * @dev Get all messages in a conversation
     */
    function getConversationMessages(uint256 conversationId)
        external view returns (Message[] memory)
    {
        return conversations[conversationId];
    }
    
    /**
     * @dev Get all messages for a proposal (alias for governance context)
     */
    function getProposalThread(uint256 proposalId) 
        external 
        view 
        returns (Message[] memory) 
    {
        return conversations[proposalId];
    }
    
    // =============== AUTHORIZATION FUNCTIONS ===============
    
    /**
     * @dev Set authorized message posters (for ConsensusEngine and other contracts)
     */
    function setAuthorizedPoster(address poster, bool authorized) external onlyOwner {
        require(poster != address(0), "Invalid poster address");
        authorizedPosters[poster] = authorized;
        emit AuthorizedPosterSet(poster, authorized);
    }
    
    /**
     * @dev Check if address is authorized to post without rate limits
     */
    function isAuthorizedPoster(address poster) external view returns (bool) {
        return authorizedPosters[poster];
    }
    
    // =============== VIEW FUNCTIONS ===============
    
    /**
     * @dev Get message count for a conversation
     */
    function getConversationMessageCount(uint256 conversationId) 
        external 
        view 
        returns (uint256) 
    {
        return conversations[conversationId].length;
    }
    
    /**
     * @dev Get messages by type for a conversation
     */
    function getMessagesByType(uint256 conversationId, uint8 messageType)
        external
        view
        returns (Message[] memory)
    {
        Message[] storage allMessages = conversations[conversationId];
        
        // Count messages of the specified type
        uint256 count = 0;
        for (uint256 i = 0; i < allMessages.length; i++) {
            if (allMessages[i].messageType == messageType) {
                count++;
            }
        }
        
        // Create filtered array
        Message[] memory filteredMessages = new Message[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allMessages.length; i++) {
            if (allMessages[i].messageType == messageType) {
                filteredMessages[index] = allMessages[i];
                index++;
            }
        }
        
        return filteredMessages;
    }
    
    /**
     * @dev Get latest messages from a conversation
     */
    function getLatestMessages(uint256 conversationId, uint256 count)
        external
        view
        returns (Message[] memory)
    {
        Message[] storage allMessages = conversations[conversationId];
        uint256 totalMessages = allMessages.length;
        
        if (totalMessages == 0) {
            return new Message[](0);
        }
        
        uint256 startIndex = totalMessages > count ? totalMessages - count : 0;
        uint256 actualCount = totalMessages - startIndex;
        
        Message[] memory latestMessages = new Message[](actualCount);
        for (uint256 i = 0; i < actualCount; i++) {
            latestMessages[i] = allMessages[startIndex + i];
        }
        
        return latestMessages;
    }
    
    /**
     * @dev Verify message integrity
     */
    function verifyMessage(
        uint256 conversationId,
        address sender,
        uint8 messageType,
        string calldata content,
        string calldata parentHash,
        uint256 timestamp,
        bytes32 providedHash
    ) external pure returns (bool) {
        bytes32 calculatedHash = keccak256(abi.encodePacked(
            conversationId,
            sender,
            messageType,
            content,
            parentHash,
            timestamp
        ));
        
        return calculatedHash == providedHash;
    }
    
    /**
     * @dev Get message type descriptions
     */
    function getMessageTypeDescription(uint8 messageType) external pure returns (string memory) {
        if (messageType == 0) return "PROPOSAL_SUBMITTED";
        if (messageType == 1) return "ANALYSIS_POSTED";
        if (messageType == 2) return "AGENT_UPDATE";
        if (messageType == 3) return "CONSENSUS_UPDATE";
        if (messageType == 4) return "EXECUTION_COMPLETE";
        if (messageType == 5) return "CHALLENGE_POSTED";
        return "UNKNOWN";
    }
    
    /**
     * @dev Get user's message statistics
     */
    function getUserStats(address user) external view returns (
        uint256 messageCount,
        uint256 lastMessage
    ) {
        return (userMessageCount[user], lastMessageTime[user]);
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalMessages,
        uint256 activeConversations
    ) {
        // Simple implementation - in production you'd track this more efficiently
        return (messageCounter, 0); // activeConversations would need separate tracking
    }
    
    // =============== ADMIN FUNCTIONS ===============
    
    /**
     * @dev Reset user message count (admin emergency function)
     */
    function resetUserMessageCount(address user) external onlyOwner {
        userMessageCount[user] = 0;
    }
    
    /**
     * @dev Emergency pause posting for a user (spam protection)
     */
    function pauseUser(address user) external onlyOwner {
        userMessageCount[user] = MAX_MESSAGES_PER_DAY;
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}