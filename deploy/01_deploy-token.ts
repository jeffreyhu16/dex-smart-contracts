import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy_token_NXP: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments: { deploy, log }, getNamedAccounts, getChainId } = hre;
    const { deployer } = await getNamedAccounts();

    const token = await deploy('Token_NXP', {
        contract: 'Token',
        from: deployer,
        log: true,
        args: [
            'Nexus Plus', 
            'NXP', 
            ethers.utils.parseEther('1000000') // 1 million
        ]
    });
}

export default deploy_token_NXP;
deploy_token_NXP.tags = ['all', 'NXP'];
