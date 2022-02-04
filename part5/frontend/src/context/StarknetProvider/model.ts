import { defaultProvider, ProviderInterface } from "starknet";

export interface StarknetState {
  account?: string;
  connected?: boolean;
  connectBrowserWallet: () => void;
  checkMissingWallet: () => void;
  setConnected: (con: boolean) => void;
  library: ProviderInterface;
}

export const STARKNET_STATE_INITIAL_STATE: StarknetState = {
  account: undefined,
  connected: false,
  connectBrowserWallet: () => undefined,
  checkMissingWallet: () => undefined,
  setConnected: () => undefined,
  library: defaultProvider,
};
