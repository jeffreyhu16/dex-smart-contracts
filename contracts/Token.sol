// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

error Token__InsufficientFunds();

contract Token {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    mapping(address => uint256) public tokenBalances;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * 1e18;
        tokenBalances[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        if (tokenBalances[msg.sender] < _value) {
            revert Token__InsufficientFunds();
        }
        tokenBalances[msg.sender] -= _value;
        tokenBalances[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
