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

    const makeOrderArgs = [
        mETH.address,
        parseEther('10'),
        NXP.address,
        parseEther('10')
    ];

    tx = await exchange.makeOrder(...makeOrderArgs);
    receipt = await tx.wait();

    let orderId: number;
    orderId = receipt.events![0].args!.id;
    console.log(`OrderID ${orderId} made by ${user_1.address}`);

    tx = await exchange.cancelOrder(orderId);
    await tx.wait();
    console.log(`OrderID ${orderId} cancelled by ${user_1.address}`);

    // fill order 1

    tx = await exchange.makeOrder(...makeOrderArgs);
    receipt = await tx.wait();

    orderId = receipt.events![0].args!.id;
    console.log(`OrderID ${orderId} made by ${user_1.address}`);

    tx = await exchange.connect(user_2).fillOrder(orderId);
    await tx.wait();
    console.log(`OrderID ${orderId} filled by ${user_2.address}`);

    // fill order 2

    tx = await exchange.makeOrder(
        mETH.address,
        parseEther('8'),
        NXP.address,
        parseEther('13')
    );
    receipt = await tx.wait();

    orderId = receipt.events![0].args!.id;
    console.log(`OrderID ${orderId} made by ${user_1.address}`);

    tx = await exchange.connect(user_2).fillOrder(orderId);
    await tx.wait();
    console.log(`OrderID ${orderId} filled by ${user_2.address}`);

    // fill order 3

    tx = await exchange.makeOrder(
        mETH.address,
        parseEther('4'),
        NXP.address,
        parseEther('9')
    );
    receipt = await tx.wait();

    orderId = receipt.events![0].args!.id;
    console.log(`OrderID ${orderId} made by ${user_1.address}`);

    tx = await exchange.connect(user_2).fillOrder(orderId);
    await tx.wait();
    console.log(`OrderID ${orderId} filled by ${user_2.address}`);

    // fill order 4

    tx = await exchange.makeOrder(
        mETH.address,
        parseEther('13'),
        NXP.address,
        parseEther('18')
    );
    receipt = await tx.wait();

    orderId = receipt.events![0].args!.id;
    console.log(`OrderID ${orderId} made by ${user_1.address}`);

    tx = await exchange.connect(user_2).fillOrder(orderId);
    await tx.wait();
    console.log(`OrderID ${orderId} filled by ${user_2.address}`);

    // create random orders

    for (let i = 0; i < 10; i++) {
        tx = await exchange.makeOrder(
            mETH.address,
            parseEther(Math.floor(Math.random() * (20 - 5) + 5).toString()),
            NXP.address,
            parseEther(Math.floor(Math.random() * (20 - 5) + 5).toString())
        );
        receipt = await tx.wait();
        orderId = receipt.events![0].args!.id;
        console.log(`OrderID ${orderId} made by ${user_1.address}`);
        console.log(`amountGet: ${receipt.events![0].args!.amountGet}`);
    }

    for (let i = 0; i < 10; i++) {
        tx = await exchange.connect(user_2).makeOrder(
            mETH.address,
            parseEther(Math.floor(Math.random() * (20 - 5) + 5).toString()),
            NXP.address,
            parseEther(Math.floor(Math.random() * (20 - 5) + 5).toString())
        );
        receipt = await tx.wait();
        orderId = receipt.events![0].args!.id;
        console.log(`OrderID ${orderId} made by ${user_1.address}`);
    }
}

main()
    .then(() => process.exit())
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
