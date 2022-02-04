import React from "react";

// eslint-disable-next-line import/no-cycle
import { StoredTransaction } from ".";
import {
  TransactionsProviderState,
  TRANSACTIONS_PROVIDER_INITIAL_STATE,
} from "./model";

export const TransactionsContext =
  React.createContext<TransactionsProviderState>(
    TRANSACTIONS_PROVIDER_INITIAL_STATE
  );

export function useTransactions() {
  return React.useContext(TransactionsContext);
}

export function useTransaction(
  hash: string | undefined
): StoredTransaction | undefined {
  const { transactions } = useTransactions();
  const [transaction, setTransaction] = React.useState<
    StoredTransaction | undefined
  >(undefined);

  React.useEffect(() => {
    const storedTransaction = transactions.find(
      (stored: StoredTransaction) => stored.hash === hash
    );
    if (storedTransaction) {
      setTransaction(storedTransaction);
    }
  }, [transactions, hash]);

  return transaction;
}
