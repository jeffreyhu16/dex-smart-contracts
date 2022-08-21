import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    localhost: {}
  },
};

export default config;
