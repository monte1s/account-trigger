const axios = require("axios");
const txHash =
  "330d6477f64b3e29ddeee43cfc445429fe9eb67dbe1ac99c444a18fac8510286";
const url = `https://tonapi.io/v2/events/${txHash}/jettons`;

axios
  .get(url, {
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer API-KEY",
    },
  })
  .then((response) => {
    const data = response.data;
    if (data?.actions[0]) {
      const action = data?.actions[0];
      console.log(
        "USDT Amount ================>",
        action.JettonTransfer.amount /
          10 ** action.JettonTransfer.jetton.decimals
      );
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
