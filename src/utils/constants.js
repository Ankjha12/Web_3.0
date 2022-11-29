import Abi from "./Transactions.json";

export const contractABI = Abi.abi; // this is a contract application binary interface that will be generate when we executed the command of running the command to deploy the smart_contract from this command npx hardhat run scripts/deploy.js --network goerli on goerli test network
export const contractAddress = "0x5118abFcCA5D50B312685F7e43291AFBF2BFd799";
