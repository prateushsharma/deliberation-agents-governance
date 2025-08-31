// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProposalRegistry
 * @dev Smart contract for community governance proposals on Citrea
 * Frontend users submit proposals here, AI agents listen and analyze
 */
contract ProposalRegistry {
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 amount;          // Amount in cBTC (8 decimals)
        address submitter;       // Wallet that submitted proposal
        string recipient;        // Address or description of recipient
        uint256 timestamp;
        ProposalStatus status;
    }
    
    enum ProposalStatus {
        SUBMITTED,      // 0 - Just submitted, waiting for analysis
        ANALYZING,      // 1 - AI agents are analyzing  
        APPROVED,       // 2 - Consensus reached: approved
        REJECTED,       // 3 - Consensus reached: rejected
        EXECUTED        // 4 - Payment has been executed
    }
    
    // Storage
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256[] public activeProposalIds;
    
    // Events that AI agents listen for
    event ProposalSubmitted(
        uint256 indexed proposalId,
        address indexed submitter,
        string title,
        uint256 amount,
        uint256 timestamp
    );
    
    event ProposalStatusChanged(
        uint256 indexed proposalId,
        ProposalStatus newStatus,
        address indexed updater
    );
    
    // Modifiers
    modifier validProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        _;
    }
    
    /**
     * @dev Submit a new governance proposal
     * @param _title Short title of the proposal
     * @param _description Detailed description
     * @param _amount Amount requested in cBTC (8 decimals)
     * @param _recipient Address or description of who receives payment
     */
    function submitProposal(
        string memory _title,
        string memory _description,
        uint256 _amount,
        string memory _recipient
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_recipient).length > 0, "Recipient cannot be empty");
        
        proposalCount++;
        uint256 newProposalId = proposalCount;
        
        proposals[newProposalId] = Proposal({
            id: newProposalId,
            title: _title,
            description: _description,
            amount: _amount,
            submitter: msg.sender,
            recipient: _recipient,
            timestamp: block.timestamp,
            status: ProposalStatus.SUBMITTED
        });
        
        activeProposalIds.push(newProposalId);
        
        emit ProposalSubmitted(
            newProposalId,
            msg.sender,
            _title,
            _amount,
            block.timestamp
        );
        
        return newProposalId;
    }
    
    /**
     * @dev Get proposal details by ID
     */
    function getProposal(uint256 _proposalId) 
        external 
        view 
        validProposal(_proposalId) 
        returns (Proposal memory) 
    {
        return proposals[_proposalId];
    }
    
    /**
     * @dev Get all active proposal IDs
     */
    function getAllActiveProposals() external view returns (uint256[] memory) {
        return activeProposalIds;
    }
    
    /**
     * @dev Update proposal status (called by consensus engine)
     */
    function updateProposalStatus(
        uint256 _proposalId, 
        ProposalStatus _newStatus
    ) external validProposal(_proposalId) {
        // In production, add access control here
        // require(msg.sender == consensusEngine, "Only consensus engine can update");
        
        proposals[_proposalId].status = _newStatus;
        
        emit ProposalStatusChanged(_proposalId, _newStatus, msg.sender);
    }
    
    /**
     * @dev Get proposals by status
     */
    function getProposalsByStatus(ProposalStatus _status) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory result = new uint256[](proposalCount);
        uint256 resultCount = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == _status) {
                result[resultCount] = i;
                resultCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory trimmedResult = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            trimmedResult[i] = result[i];
        }
        
        return trimmedResult;
    }
    
    /**
     * @dev Get proposals by submitter
     */
    function getProposalsBySubmitter(address _submitter) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory result = new uint256[](proposalCount);
        uint256 resultCount = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].submitter == _submitter) {
                result[resultCount] = i;
                resultCount++;
            }
        }
        
        // Resize array
        uint256[] memory trimmedResult = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            trimmedResult[i] = result[i];
        }
        
        return trimmedResult;
    }
    
    /**
     * @dev Get total proposals count
     */
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }
    
    /**
     * @dev Get recent proposals (last N proposals)
     */
    function getRecentProposals(uint256 _count) 
        external 
        view 
        returns (uint256[] memory) 
    {
        if (_count == 0 || proposalCount == 0) {
            return new uint256[](0);
        }
        
        uint256 actualCount = _count > proposalCount ? proposalCount : _count;
        uint256[] memory result = new uint256[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            result[i] = proposalCount - i; // Most recent first
        }
        
        return result;
    }
}

