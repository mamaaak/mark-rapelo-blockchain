// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    // 1. Setup the Token Name and Symbol
    constructor() ERC20("Tier3Token", "T3T") {
        // Optional: Mint initial supply to the deployer (e.g., 1 million tokens)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // 2. Allow anyone to mint tokens (Public Faucet Pattern)
    // In production, you would protect this function!
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}