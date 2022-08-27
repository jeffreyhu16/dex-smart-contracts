import { assert } from 'chai';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from "../../helper-hardhat-config";
import { Token } from '../../typechain-types';

if (developmentChains.includes(network.name)) {
    describe('Token Unit Test', () => {
        let deployer: string, token: Token;
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
                    ethers.utils.parseEther('1000000').toString(),
                    tokenSupply.toString()
                );
            });
        });
    });
} else {
    describe.skip;
}