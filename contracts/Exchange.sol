//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Token.sol";

error Exchange__TransferFromFailed();

contract Exchange {
    address public feeAccount;
    uint256 public feeRate;
    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );

    constructor(address _feeAccount, uint256 _feeRate) {
        feeAccount = _feeAccount;
        feeRate = _feeRate;
    }

    function depositToken(address _token, uint256 _amount) public {
        Token token = Token(_token);
        if (token.transferFrom(msg.sender, address(this), _amount) == false) {
            revert Exchange__TransferFromFailed();
        }
        tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
}
