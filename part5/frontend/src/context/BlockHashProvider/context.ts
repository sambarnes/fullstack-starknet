import React from "react";

export const BlockHashContext = React.createContext<string | undefined>(
  undefined
);

export function useBlockHash() {
  return React.useContext(BlockHashContext);
}
