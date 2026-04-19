import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { USER_NAME } from "../config";

export default function Navbar({ currentPage, setCurrentPage }) {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="gradient-bg text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {USER_NAME} Supply Chain DApp
          </h1>
          <p className="text-sm opacity-90">Transparent & Traceable Supply Chain</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            {[
              "home",
              "register",
              "transfer",
              "products",
              "history",
              "admin",
            ].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded transition-all ${
                  currentPage === page
                    ? "bg-white text-purple-600 font-semibold"
                    : "hover:bg-white hover:bg-opacity-20"
                }`}
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <span className="bg-white bg-opacity-20 px-4 py-2 rounded">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-white text-purple-600 font-semibold px-6 py-2 rounded hover:bg-opacity-90 transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
