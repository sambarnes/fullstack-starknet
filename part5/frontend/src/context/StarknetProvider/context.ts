import React from "react";

import { StarknetState, STARKNET_STATE_INITIAL_STATE } from "./model";

export const StarknetContext = React.createContext<StarknetState>(
  STARKNET_STATE_INITIAL_STATE
);

export function useStarknet() {
  return React.useContext(StarknetContext);
}
