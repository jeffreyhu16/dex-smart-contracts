import { TransactionResponse } from "@ethersproject/abstract-provider";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { Exchange, Token } from "../../typechain-types";

if (developmentChains.includes(network.name)) {
    describe('Exchange Unit Test', () => {
        let deployer: string, exchange: Exchange;
        let token_1: Token, token_2: Token;
        const { utils: { parseEther } } = ethers;

        beforeEach(async () => {
            await deployments.fixture(['all']);
            deployer = (await getNamedAccounts()).deployer;
            exchange = await ethers.getContract('Exchange');
            token_1 = await ethers.getContract('Token');
        });

        describe('constructor', () => {
            it('assigns arguments correctly', async () => {
                const feeAccount = await exchange.feeAccount();
                const feeRate = await exchange.feeRate();
                assert.equal(deployer, feeAccount);
                assert.equal(
                    feeRate.toString(),
                    parseEther('0.01').toString()
                );
            });
        });

        describe('depositToken', () => {
            let receiver: SignerWithAddress, depositTx: TransactionResponse;

            beforeEach(async () => {
                receiver = (await ethers.getSigners())[1];
                const approveTx = await token_1.approve(exchange.address, parseEther('1000'));
                await approveTx.wait();
                depositTx = await exchange.depositToken(token_1.address, parseEther('1000'));
                await depositTx.wait();
            });

            it('emits Transfer event from calling transferFrom function', async () => {
                await expect(depositTx).to.emit(token_1, 'Transfer')
                    .withArgs(
                        deployer,
                        exchange.address,
                        parseEther('1000')
                    );
            });

            it('updates balance of tokens deposited', async () => {
                const depositBalance = await exchange.tokens(token_1.address, deployer);
                assert.equal(
                    depositBalance.toString(),
                    parseEther('1000').toString()
                );
            });

            it('emits Deposit event', async () => {
                await expect(depositTx).to.emit(exchange, 'Deposit')
                    .withArgs(
                        token_1.address,
                        deployer,
                        parseEther('1000'),
                        await exchange.tokens(token_1.address, deployer)
                    );
            });
        });
    });
} else {
    describe.skip;
}