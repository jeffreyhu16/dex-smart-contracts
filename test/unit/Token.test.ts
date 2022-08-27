import { assert, expect } from 'chai';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from "../../helper-hardhat-config";
import { Token } from '../../typechain-types';

if (developmentChains.includes(network.name)) {
    describe('Token Unit Test', () => {
        let deployer: string, token: Token;
        const { utils: { parseEther } } = ethers;

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(['all']);
            token = await ethers.getContract('Token');
        });

        describe('constructor', () => {
            it('assigns arguments correctly', async () => {
                const name = await token.name();
                const symbol = await token.symbol();
                const tokenSupply = await token.totalSupply()
                assert.equal('Nexus Plus', name);
                assert.equal('NXP', symbol);
                assert.equal(
                    parseEther('1000000').toString(),
                    tokenSupply.toString()
                );
            });
        });

        describe('transfer', () => {
            it('reverts if transferring to zero address', async () => {
                const receiver = ethers.constants.AddressZero;
                await expect(token.transfer(receiver, parseEther('1000')))
                    .to.be.revertedWithCustomError(token, 'Token__TransferringZeroAddress');
            });
            it('reverts if sender has insufficient funds', async () => {
                const receiver = (await ethers.getSigners())[1];
                await expect(token.transfer(receiver.address, parseEther('10000000'))) // 10 million
                    .to.be.revertedWithCustomError(token, 'Token__InsufficientFunds');
            });
            it('transfers token balance correctly', async () => {
                const receiver = (await ethers.getSigners())[1];
                const receiverBefore = await token.tokenBalances(receiver.address);
                const senderBefore = await token.tokenBalances(deployer);

                await token.transfer(receiver.address, parseEther('1000'));

                const receiverAfter = await token.tokenBalances(receiver.address);
                const senderAfter = await token.tokenBalances(deployer);
                assert.equal(
                    receiverAfter.sub(receiverBefore).toString(),
                    parseEther('1000').toString()
                );
                assert.equal(
                    senderBefore.sub(senderAfter).toString(),
                    parseEther('1000').toString()
                );
            });
            it('emits Transfer event', async () => {
                const receiver = (await ethers.getSigners())[1];
                await expect(token.transfer(receiver.address, parseEther('1000')))
                    .to.emit(token, 'Transfer')
                    .withArgs(
                        deployer,
                        receiver.address,
                        parseEther('1000')
                    );
            });
        });

        describe('approve', () => {
            it('reverts if approving to zero address', async () => {
                const spender = ethers.constants.AddressZero;
                await expect(token.approve(spender, parseEther('1000')))
                    .to.be.revertedWithCustomError(token, 'Token__ApprovingZeroAddress');
            });
            it('updates spender allowance', async () => {
                const spender = (await ethers.getSigners())[1];
                await token.approve(spender.address, parseEther('1000'));
                const allowance = await token.allowance(deployer, spender.address);
                assert.equal(
                    allowance.toString(),
                    parseEther('1000').toString()
                );
            });
            it('emits Approval event', async () => {
                const spender = (await ethers.getSigners())[1];
                await expect(token.approve(spender.address, parseEther('1000')))
                    .to.emit(token, 'Approval')
                    .withArgs(
                        deployer,
                        spender.address,
                        parseEther('1000')
                    );
            });
        });
    });
} else {
    describe.skip;
}
