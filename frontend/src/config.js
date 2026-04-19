export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xE3c098D1f11Da0b42717C9b323C6BBe121f7DDeb";
export const CHAIN_ID = 11155111; // Sepolia Testnet
export const CHAIN_NAME = "Ethereum Sepolia Testnet";
export const RPC_URL = "https://ethereum-sepolia.publicnode.com";
export const USER_NAME = "Shahzaib";
export const NETWORK_EXPLORER = "https://sepolia.etherscan.io";

export const ROLE_NAMES = {
  0: "Manufacturer",
  1: "Distributor",
  2: "Retailer",
  3: "Customer",
};

export const STATUS_NAMES = {
  0: "Manufactured",
  1: "In Transit",
  2: "Delivered",
  3: "Received",
};

export const COLORS = {
  Manufactured: "#3b82f6",
  "In Transit": "#f59e0b",
  Delivered: "#10b981",
  Received: "#8b5cf6",
};
