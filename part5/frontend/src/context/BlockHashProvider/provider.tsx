import React from "react";
import { useStarknet } from "../StarknetProvider";
import { BlockHashContext } from "./context";

interface BlockHashProviderProps {
  children: React.ReactNode;
  interval?: number;
}

export function BlockHashProvider({
  interval,
  children,
}: BlockHashProviderProps): JSX.Element {
  const { library } = useStarknet();
  const [blockHash, setBlockHash] = React.useState<string | undefined>(
    undefined
  );

  const fetchBlockHash = React.useCallback(() => {
    library.getBlock().then((block) => {
      setBlockHash(block.block_hash);
    });
  }, [library]);

  React.useEffect(() => {
    fetchBlockHash();
    const intervalId = setInterval(() => {
      fetchBlockHash();
    }, interval ?? 5000);
    return () => clearInterval(intervalId);
  }, [interval, fetchBlockHash]);

  return <BlockHashContext.Provider value={blockHash} children={children} />;
}
