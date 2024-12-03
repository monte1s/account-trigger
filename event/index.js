require('dotenv').config();
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const { WebSocketURL } = process.env;

const web3 = createAlchemyWeb3(WebSocketURL);
const subscription = web3.eth.subscribe("pendingTransactions", (err, res) => {
    if (err) console.error(err);
});

const account1 = "0xa7B...";

const init_web3 = function () {
    subscription.on("data", (txHash) => {
        setTimeout(async () => {
            try {
                const tx = await web3.eth.getTransaction(txHash);
                if (tx?.to === account1) {
                    console.log("Receiving some eth for account 1: ", tx);
                }
            } catch (err) {
                console.error(err);
            }
        }, 3000)
    });
};

init_web3();