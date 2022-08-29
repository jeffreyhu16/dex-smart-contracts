import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { developmentChains } from "../../helper-hardhat-config";
import { Exchange, Token } from "../../typechain-types";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";

if (developmentChains.includes(network.name)) {
    describe('Exchange Unit Test', () => {
        let deployer: string, exchange: Exchange;
        let token_1: Token, token_2: Token;
        const { utils: { parseEther }, BigNumber } = ethers;

        beforeEach(async () => {
            await deployments.fixture(['all']);
            deployer = (await getNamedAccounts()).deployer;
            exchange = await ethers.getContract('Exchange');
            token_1 = await ethers.getContract('Token');

            const Token = await ethers.getContractFactory('Token');
            token_2 = (await Token.deploy('Wrapped DAI', 'wDAI', parseEther('1000000'))) as Token;
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

        describe('withdrawToken', () => {
            let depositTx: TransactionResponse, withdrawTx: TransactionResponse;

            beforeEach(async () => {
                const approveTx = await token_1.approve(exchange.address, parseEther('1000'));
                await approveTx.wait();
                depositTx = await exchange.depositToken(token_1.address, parseEther('1000'));
                await depositTx.wait();
                withdrawTx = await exchange.withdrawToken(token_1.address, parseEther('1000'));
                await withdrawTx.wait();
            });

            it('emits Transfer event from calling transfer function', async () => {
                await expect(withdrawTx).to.emit(token_1, 'Transfer')
                    .withArgs(
                        exchange.address,
                        deployer,
                        parseEther('1000')
                    );
            });

            it('updates balance of tokens withdrawn', async () => {
                const depositBalance = await exchange.tokens(token_1.address, deployer);
                assert.equal(depositBalance.toString(), '0');
            });

            it('emits Withdraw event', async () => {
                await expect(withdrawTx).to.emit(exchange, 'Withdraw')
                    .withArgs(
                        token_1.address,
                        deployer,
                        parseEther('1000'),
                        await exchange.tokens(token_1.address, deployer)
                    );
            });
        });

        describe('makeOrder', () => {
            let makeOrderArgs: [string, BigNumber, string, BigNumber];

            beforeEach(async () => {
                const approveTx = await token_1.approve(exchange.address, parseEther('1000'));
                await approveTx.wait();
                const depositTx = await exchange.depositToken(token_1.address, parseEther('1000'));
                await depositTx.wait();
                makeOrderArgs = [
                    token_2.address,
                    parseEther('1000'),
                    token_1.address,
                    parseEther('1000')
                ];
            });

            it('reverts if deposited token balance is insufficient for trading', async () => {
                await expect(exchange.makeOrder(
                    token_2.address,
                    parseEther('100000'),
                    token_1.address,
                    parseEther('100000')
                )).to.be.revertedWithCustomError(exchange, 'Exchange__InsufficientDeposit');
            });
            it('increments orderCount by 1', async () => {
                const countBefore = await exchange.orderCount();
                const orderTx = await exchange.makeOrder(...makeOrderArgs);
                await orderTx.wait();
                const countAfter = await exchange.orderCount();
                assert.equal(countAfter.sub(countBefore).toString(), '1');
            });
            it('creates Order struct', async () => {
                const orderTx = await exchange.makeOrder(...makeOrderArgs);
                await orderTx.wait();
                const newOrder = await exchange.orders(1);

                assert.equal(newOrder.id.toString(), '1');
                assert.equal(newOrder.user, deployer);
                for (let i = 0; i < makeOrderArgs.length; i++) {
                    assert.equal(
                        newOrder[i + 2].toString(),
                        makeOrderArgs[i].toString()
                    );
                }
            });
            it('emits OrderMade event', async () => {
                const orderTx = await exchange.makeOrder(...makeOrderArgs);
                const receipt = await orderTx.wait();
                await expect(orderTx).to.emit(exchange, 'OrderMade');

                const event = receipt.events![0];
                assert.equal(event.args!.id.toString(), '1');
                assert.equal(event.args!.user, deployer);
                for (let i = 0; i < makeOrderArgs.length; i++) {
                    assert.equal(
                        event.args![i + 2].toString(),
                        makeOrderArgs[i].toString()
                    );
                };
            });
        });

        describe('cancelOrder', () => {
            let makeOrderArgs: [string, BigNumber, string, BigNumber];

            beforeEach(async () => {
                const approveTx = await token_1.approve(exchange.address, parseEther('1000'));
                await approveTx.wait();
                const depositTx = await exchange.depositToken(token_1.address, parseEther('1000'));
                await depositTx.wait();
                makeOrderArgs = [
                    token_2.address,
                    parseEther('1000'),
                    token_1.address,
                    parseEther('1000')
                ];
                const orderTx = await exchange.makeOrder(...makeOrderArgs);
                await orderTx.wait();
            });

            it('reverts if order id was not found', async () => {
                await expect(exchange.cancelOrder(2))
                    .to.be.revertedWithCustomError(exchange, 'Exchange__OrderNotFound');
            });
            it('reverts if msg.sender was not owner of order', async () => {
                const nonOwner = (await ethers.getSigners())[1];
                await expect(exchange.connect(nonOwner).cancelOrder(1))
                    .to.be.revertedWithCustomError(exchange, 'Exchange__NotOwner');
            });
            it('updates orderCancelled mapping', async () => {
                const cancelTx = await exchange.cancelOrder(1);
                await cancelTx.wait();
                assert(await exchange.orderCancelled(1));
            });
            it('emits OrderCancelled event', async () => {
                const cancelTx = await exchange.cancelOrder(1);
                const receipt = await cancelTx.wait();
                await expect(cancelTx).to.emit(exchange, 'OrderCancelled');

                const { args } = receipt.events![0];
                assert.equal(args!.id.toString(), '1');
                assert.equal(args!.user, deployer);
                for (let i = 0; i < makeOrderArgs.length; i++) {
                    assert.equal(
                        args![i + 2].toString(),
                        makeOrderArgs[i].toString()
                    );
                };
            });
        });
    });
} else {
    describe.skip;
}