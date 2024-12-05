import TonWeb from "tonweb";

// Initialize the HttpProvider with your API key
const provider = new TonWeb.HttpProvider(
  "https://toncenter.com/api/v2/jsonRPC",
  {
    apiKey: "a11b9aa30744af888be2516daad716003db714e9c7481615db97d08a1776157a",
  }
);

// Create an instance of TonWeb with the provider
const Ton = new TonWeb(provider);

const USDT = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs";
const USER = "EQCNx6FdfpdfghaJtax3J1sjNmsL3krsHHWsS5wKXyxhWWqR";
const HASH = "rtkamHPbkIyEf9GViathKDTW75Thgr6LN39UvzYoePw=";

// Function to decode BOC data
async function decodeBoc(bocData) {
  try {
    const usdtTx = await Ton.getTransactions(USDT, 1, 51533084000001, HASH);
    // console.log(usdtTx);
  } catch (error) {
    console.error("ERROR USDT:", error);
  }

  console.log("-----------------------------------------");

  try {
    const userTx = await Ton.getTransactions(
      USER,
      1,
      51501444000001,
      "3wUhClZB3uiu/jZyDRIBZAXaATlZNnR34irETbjMmME="
    );
    const data = userTx[0];
    
    console.log(data.in_msg.msg_data);

    // Use TonWeb's methods to parse or interpret the decoded data as needed
  } catch (error) {
    console.error("ERROR USER:", error);
  }
}

const bocString =
  "te6cckECBgEAAT0AAYAikW0I0tdA6yEN8qSgR53uElAiCsH59pknafzP+3wHLFJIZJpOQMGwNq7iXudoS3gk+6Vl+r2dWv3ZPT4g9fEBAQElAAAQrQF7RpIAAAAAzp4u6gBwhAIBaGIARUX4N/WPNv6UoF4CgNqwFV0nyYj0UBtHDWye+E/gsqCgjw0YAAAAAAAAAAAAAAAAAAEDAbAPin6lAAAAAAAAAABKvEkaKAAxVRxd2qLo+1wGeA83JxB7KDlbHsqLPl3TmujpbXHauwAjcehXX6XX4IWibWsdydbIzZrC95K7Bx1rEucCl8sYVkgL68IBBAFN46DUgoAHy/+VG7+ebYbZP+jeYqxVVqNzIpCLWthNl7zJOrFKsQBABQBLAAAAAIAbTd9J6QK1uOUcC/k2NrJQwDgdH9jF16nK3sdsywY1qIHv/O/u"; // Ensure this is a valid BOC string

// Call the decode function
decodeBoc(bocString);
