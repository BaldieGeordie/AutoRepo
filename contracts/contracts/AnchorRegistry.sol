// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AnchorRegistry
 * @notice Minimal anchoring contract for VINtegrity assembly snapshots
 * @dev Stores first-seen timestamp for a canonical hash and emits an event
 */
contract AnchorRegistry {
    // canonical hash => first anchored timestamp (unix seconds)
    mapping(bytes32 => uint256) public anchoredAt;

    event Anchored(
        bytes32 indexed eventHash,
        address indexed sender,
        uint256 blockTimestamp
    );

    /**
     * @notice Anchor a canonical hash on-chain
     * @param eventHash keccak256 hash of canonical snapshot payload
     */
    function anchor(bytes32 eventHash) external {
        require(eventHash != bytes32(0), "eventHash is zero");
        require(anchoredAt[eventHash] == 0, "already anchored");

        anchoredAt[eventHash] = block.timestamp;
        emit Anchored(eventHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Check if an event hash has been anchored
     */
    function isAnchored(bytes32 eventHash) external view returns (bool) {
        return anchoredAt[eventHash] != 0;
    }
}
