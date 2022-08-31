import { ethers } from "hardhat";

const main = async () => {
    const token_NXP = await ethers.getContract('Token_NXP');
    console.log('token_NXP:', token_NXP.address);

    const token_mETH = await ethers.getContract('Token_mETH');
    console.log('token_mETH:', token_mETH.address);

    const token_mDAI = await ethers.getContract('Token_mDAI');
    console.log('token_mDAI:', token_mDAI.address);

    const exchange = await ethers.getContract('Exchange');
    console.log('Exchange:', exchange.address);

    const user_1 = (await ethers.getSigners())[0];
    const user_2 = (await ethers.getSigners())[1];

    
}

main()
    .then(() => process.exit())
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
