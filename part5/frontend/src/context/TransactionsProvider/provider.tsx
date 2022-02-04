/* eslint-disable import/no-cycle */
import React from "react";
import { AddTransactionResponse } from "starknet";
import useDeepCompareEffect from "use-deep-compare-effect";

import { useBlockHash } from "../BlockHashProvider";
import { useStarknet } from "../StarknetProvider";

import { TransactionsContext } from "./context";
import { StoredTransaction } from "./model";
import transactionsReducer from "./reducer";

interface TransactionsProviderProps {
  children: React.ReactNode;
}

const TransactionsProvider = ({
  children,
}: TransactionsProviderProps): JSX.Element => {
  const { library } = useStarknet();
  const blockHash = useBlockHash();
  const [transactions, dispatch] = React.useReducer(transactionsReducer, []);

  const addTransaction = React.useCallback(
    (payload: AddTransactionResponse) => {
      dispatch({
        type: "ADD_TRANSACTION",
        payload,
      });
    },
    [dispatch]
  );

  useDeepCompareEffect(() => {
    const updateTransactions = async () => {
      if (!blockHash) {
        return;
      }

      const checkTransaction = async (tx: StoredTransaction) => {
        // eslint-disable-next-line no-console
        console.log(`checking tx status ${tx.hash}`);
        if (
          tx.code === "REJECTED" ||
          tx.code === "ACCEPTED_ON_L1" ||
          tx.code === "ACCEPTED_ON_L2"
        ) {
          return tx;
        }

        if (tx.lastChecked === blockHash) {
          return tx;
        }

        try {
          const newStatus = await library.getTransactionStatus(tx.hash);
          // eslint-disable-next-line no-console
          console.log(`new status ${newStatus.tx_status}`);
          const newTransaction: StoredTransaction = {
            ...tx,
            code: newStatus.tx_status,
            lastChecked: blockHash,
          };
          return newTransaction;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`failed to check transaction status: ${tx.hash}`);
        }

        return tx;
      };

      const newTransactions: StoredTransaction[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const tx of transactions) {
        // eslint-disable-next-line no-await-in-loop
        const newTransaction = await checkTransaction(tx);
        newTransactions.push(newTransaction);
      }

      dispatch({
        type: "UPDATE_TRANSACTIONS",
        payload: newTransactions,
      });
    };

    updateTransactions();
  }, [blockHash, transactions]);

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction }}
      // eslint-disable-next-line react/no-children-prop
      children={children}
    />
  );
};

export default TransactionsProvider;
