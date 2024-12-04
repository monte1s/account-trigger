import TonWeb from "tonweb";

export async function getAddressTransactions(options) {
  const {
    provider,
    skipBeforeTime,
    itemsPerPage = 20,
    useHistoricalNodes,
  } = options;

  const address = new TonWeb.Address(options.address);

  let lastTransactionTime;
  let isLastPage = false;
  let offsetLt;
  let offsetHash;
  let transactions = [];

  const newTransactions = [];
  const processedTransactions = new Set();

  // Fetching transactions batch-by-batch, until all
  // the desired transactions were processed
  loop: do {
    transactions = await fetchTransactions({
      provider,
      address,

      // At this moment TonCenter returns overlapping results
      // in its responses, when offset LT i used, so we have
      // to drop one transaction from the response. Increasing
      // the page size by one to accord for this discrepancy.
      // @todo: remove this when it's fixed.
      limit: offsetLt ? itemsPerPage + 1 : itemsPerPage,

      lt: offsetLt,
      hash: offsetHash,
      archival: useHistoricalNodes,
      maxRetries: options.maxRetries,
      retryDelay: options.retryDelay,
      onHttpError: options.onHttpError,
    });

    options.onBatchLoaded?.({
      offsetLt,
      offsetHash,
      transactions,
    });

    // Checking if we've reached the end
    if (transactions.length === 0) {
      break;
    }

    // Setting last transaction time to the time
    // of the first transaction from the first batch
    if (!lastTransactionTime) {
      lastTransactionTime = transactions[0].utime;
    }

    for (const transaction of transactions) {
      // Stopping the further processing if the
      // desired time mark is reached
      // @todo: check if it should be "<" or "<="
      if (skipBeforeTime !== undefined && transaction.utime <= skipBeforeTime) {
        break loop;
      }

      // Skipping transaction that are already processed.
      // At this moment TonCenter returns overlapping results
      // in its responses.
      // @todo: remove this when it's fixed.
      const { lt, hash } = transaction.transaction_id;
      const transactionId = `${lt}:${hash}`;
      if (processedTransactions.has(transactionId)) {
        continue;
      }

      newTransactions.push(transaction);
      processedTransactions.add(transactionId);

      options.onTransactionDiscovered?.({ transaction });
    }

    // Getting offset values for the next batch API call
    // -----

    const { transaction_id } = transactions[transactions.length - 1];

    offsetLt = transaction_id.lt;
    offsetHash = transaction_id.hash;

    isLastPage = transactions.length < itemsPerPage;
  } while (!isLastPage);

  return {
    lastTransactionTime,
    transactions: newTransactions,
  };
}

async function fetchTransactions(options) {
  const {
    provider,
    limit,
    lt = "",
    hash,
    archival,
    maxRetries = 5,
    retryDelay = 3000,
  } = options;

  const address = new TonWeb.Address(options.address);

  let triesCount = 0;
  let gotResponse = false;

  while (!gotResponse) {
    triesCount++;

    try {
      return await provider.getTransactions(
        address.toString(false),
        limit,
        parseInt(lt, 10),
        hash,
        undefined,
        archival
      );
    } catch (error) {
      options.onHttpError?.(error);

      if (triesCount >= maxRetries) {
        throw error;
      }

      await wait(retryDelay);
    }
  }
}

function wait(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
