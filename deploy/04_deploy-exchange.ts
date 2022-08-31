import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployExchange: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments: { deploy, log }, getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();

    const exchange = await deploy('Exchange', {
        from: deployer,
        log: true,
        args: [deployer, '1']
    });
}

export default deployExchange;
deployExchange.tags = ['all', 'exchange'];
