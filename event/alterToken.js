require("dotenv").config();
const ethers = require("ethers");
const erc20ABI = require("./ERC20ABI.json");
const { WebSocketURL } = process.env;

const USDT_CONTRACT_ADDRESS = "0x228cb512d18da79e49dd378af9722fa76a605ce3"; // USDT on BSC
const YOUR_WALLET_ADDRESS = "0xa7B9..."; // Your wallet address

// Create a provider using Ethers.js
const provider = new ethers.providers.WebSocketProvider(WebSocketURL);

// Create a contract instance
const usdtContract = new ethers.Contract(
  USDT_CONTRACT_ADDRESS,
  erc20ABI,
  provider
);

// Listen for Transfer events
usdtContract.on("Transfer", (from, to, value) => {
  if (to.toLowerCase() === YOUR_WALLET_ADDRESS.toLowerCase()) {
    console.log(
      `Received ${ethers.utils.formatUnits(value, 6)} USDT from ${from}`
    );
  }
});

// Handle errors
provider.on("error", (error) => {
  console.error("Error:", error);
});
