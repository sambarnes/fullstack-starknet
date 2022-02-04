import { AddTransactionResponse, Status } from "starknet";

export interface StoredTransaction {
  code: Status;
  hash: string;
  address?: string;
  lastChecked: string;
}

export type StoredTransactionsState = StoredTransaction[];

export interface TransactionsProviderState {
  transactions: StoredTransactionsState;
  addTransaction: (tx: AddTransactionResponse) => void;
}

export const TRANSACTIONS_PROVIDER_INITIAL_STATE: TransactionsProviderState = {
  transactions: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addTransaction: (_tx) => undefined,
};
