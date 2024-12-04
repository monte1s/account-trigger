import TonWeb from "tonweb";

import { getAddressTransactions } from "./address-transactions.js";

(async () => {
  const provider = new TonWeb.HttpProvider(
    "https://toncenter.com/api/v2/jsonRPC",
    {
      apiKey:
        "a11b9aa30744af888be2516daad716003db714e9c7481615db97d08a1776157a",
    }
  );

  const myAddress = "EQDYfEIEjr-cEfwS_M9hN8_gh4cqQBpi52wvFjoShyuIezJ_";

  const onBatchLoaded = (event) => {
    const { offsetLt, offsetHash, transactions } = event;
    if (offsetLt) {
      console.log(
        `Got ${transactions.length} transaction(s) before ` +
          `transaction #${offsetLt}:${offsetHash}`
      );
    } else {
      console.log(`Got ${transactions.length} last transaction(s)`);
    }
  };

  const onTransactionDiscovered = (event) => {
    const { transaction } = event;
    const { lt, hash } = transaction.transaction_id;
    console.log(`Discovered transaction #${lt}:${hash}`);
  };

  const onHttpError = (error) => console.error(error);

  let skipBeforeTime;

  while (true) {
    const result = await getAddressTransactions({
      provider,
      address: myAddress,
      skipBeforeTime,
      itemsPerPage: 5,
      useHistoricalNodes: true,
      onBatchLoaded,
      onTransactionDiscovered,
      onHttpError,
    });

    for (const transaction of result.transactions) {
      const { lt, hash } = transaction.transaction_id;

      const { source, destination, value, msg_data } = transaction.in_msg;

      const isExternal = !source;

      const hasOutMessages = transaction.out_msgs.length > 0;

      let payload;
      let message;
      switch (msg_data["@type"]) {
        case "msg.dataText": {
          message = TonWeb.utils.base64toString(msg_data.text || "");
          break;
        }
        case "msg.dataRaw": {
          payload = TonWeb.utils.base64ToBytes(msg_data.body || "");
          break;
        }
        default: {
          console.warn(`Unknown payload type: ${msg_data["@type"]}`);
          break;
        }
      }

      console.log(
        `Processing transaction #${lt}:${hash}\n` +
          `from: ${isExternal ? "external" : source}\n` +
          `to: ${destination}\n` +
          `value: ${TonWeb.utils.fromNano(value)}\n` +
          `has out messages: ${hasOutMessages ? "Yes" : "No"}\n` +
          (message ? `message: ${message}\n` : "")
      );
    }

    skipBeforeTime = result.lastTransactionTime;

    console.log(`Waiting for 5 seconds…`);

    await wait(5 * 1000);
  }
})();

function wait(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
