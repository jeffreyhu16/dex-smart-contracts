import { ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";

const main = async () => {
    const { utils: { parseEther } } = ethers;

    const NXP = await ethers.getContract('Token_NXP');
    console.log('token_NXP:', NXP.address);

    const mETH = await ethers.getContract('Token_mETH');
    console.log('token_mETH:', mETH.address);

    const mDAI = await ethers.getContract('Token_mDAI');
    console.log('token_mDAI:', mDAI.address);

    const exchange = await ethers.getContract('Exchange');
    console.log('Exchange:', exchange.address);

    const user_1 = (await ethers.getSigners())[0];
    const user_2 = (await ethers.getSigners())[1];

    let orderId: number;
    let tx: ContractTransaction, receipt: ContractReceipt;
    const amount = parseEther('1000');

    tx = await NXP.approve(exchange.address, amount);
    await tx.wait();
    console.log(`Approved ${amount} NXP from ${user_1.address}`);

    tx = await exchange.depositToken(NXP.address, amount);
    await tx.wait();
    console.log(`Deposited ${amount} NXP by ${user_1.address}`,);

    tx = await mETH.transfer(user_2.address, amount);
    await tx.wait();
    console.log(`Transferred ${amount} mETH from ${user_1.address} to ${user_2.address}`);

    tx = await mETH.connect(user_2).approve(exchange.address, amount);
    await tx.wait();
    console.log(`Approved ${amount} mETH from ${user_2.address}`);

    tx = await exchange.connect(user_2).depositToken(mETH.address, amount);
    await tx.wait();
    console.log(`Deposited ${amount} mETH by ${user_2.address}`);

    // create 15 random orders and fill 5 of them

    for (let i = 0; i < 15; i++) {
        tx = await exchange.makeOrder(
            mETH.address,
            parseEther(Math.floor(Math.random() * (10 - 1) + 1).toString()),
            NXP.address,
            parseEther(Math.floor(Math.random() * (20 - 10) + 10).toString())
        );
        receipt = await tx.wait();
        orderId = receipt.events![0].args!.id;
        console.log(`OrderID ${orderId} made by ${user_1.address}`);
        if (i < 5) {
            tx = await exchange.connect(user_2).fillOrder(orderId);
            await tx.wait();
            console.log(`OrderID ${orderId} filled by ${user_2.address}`);
        }
    }

    for (let i = 0; i < 15; i++) {
        tx = await exchange.connect(user_2).makeOrder(
            NXP.address,
            parseEther(Math.floor(Math.random() * (20 - 10) + 10).toString()),
            mETH.address,
            parseEther(Math.floor(Math.random() * (10 - 1) + 1).toString())
        );
        receipt = await tx.wait();
        orderId = receipt.events![0].args!.id;
        console.log(`OrderID ${orderId} made by ${user_2.address}`);
        if (i < 5) {
            tx = await exchange.connect(user_1).fillOrder(orderId);
            await tx.wait();
            console.log(`OrderID ${orderId} filled by ${user_1.address}`);
        }
    }
}

main()
    .then(() => process.exit())
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
