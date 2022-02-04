import { Button } from "@chakra-ui/react";
import { useEffect } from "react";

import { useStarknet } from "context";

const WalletConnect = () => {
  const {
    account,
    connected,
    setConnected,
    connectBrowserWallet,
    checkMissingWallet,
  } = useStarknet();

  useEffect(() => {
    checkMissingWallet();
  }, [checkMissingWallet]);

  useEffect(() => {
    if (account && account.length > 0) {
      setConnected(true);
    }
  }, [account, setConnected, connected]);

  return !connected ? (
    <Button
      ml="4"
      textDecoration="none !important"
      outline="none !important"
      boxShadow="none !important"
      onClick={() => {
        connectBrowserWallet();
      }}
    >
      Connect Wallet
    </Button>
  ) : (
    <Button
      ml="4"
      textDecoration="none !important"
      outline="none !important"
      boxShadow="none !important"
      onClick={() => {
        setConnected(false);
      }}
    >
      {account
        ? `${account.substring(0, 4)}...${account.substring(
            account.length - 4
          )}`
        : "No Account"}
    </Button>
  );
};

export default WalletConnect;
