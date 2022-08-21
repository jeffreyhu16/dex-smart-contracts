import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments: { deploy, log }, getNamedAccounts, getChainId } = hre;
    const { deployer } = await getNamedAccounts();

    const token = await deploy('Token', {
        from: deployer,
        log: true,
        args: []
    });
}

export default deployToken;
deployToken.tags = ['all', 'token'];
