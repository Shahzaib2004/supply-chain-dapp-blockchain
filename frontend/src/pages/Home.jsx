import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ROLE_NAMES, STATUS_NAMES, COLORS } from "../config";

export default function Home() {
  const { contract, isConnected } = useWeb3();
  const [contractInfo, setContractInfo] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && contract) {
      fetchContractInfo();
      fetchUserRole();
    }
  }, [isConnected, contract]);

  const fetchContractInfo = async () => {
    try {
      setLoading(true);
      const info = await contract.getContractInfo();
      setContractInfo({
        name: info.name,
        owner: info.contractOwner,
        totalProducts: info.totalProducts.toString(),
        totalUsers: info.totalUsers.toString(),
      });
    } catch (error) {
      console.error("Error fetching contract info:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const signer = await contract.runner;
      const userAddress = await signer.getAddress();
      const user = await contract.getUser(userAddress);
      setUserRole(ROLE_NAMES[user.role]);
    } catch (error) {
      console.log("User not registered or not connected");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Welcome to Shahzaib Supply Chain
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your MetaMask wallet to get started
          </p>
          <div className="bg-blue-100 border border-blue-400 text-blue-700 p-4 rounded-lg space-y-2">
            <p className="font-semibold">📋 Quick Setup:</p>
            <p className="text-sm">1. Open MetaMask</p>
            <p className="text-sm">2. Click the connect button in the navbar</p>
            <p className="text-sm">3. Make sure you're on Sepolia Testnet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-4xl sm:text-5xl mb-4">⛓️</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Shahzaib Supply Chain
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Transparent, Traceable & Tamper-proof Supply Chain Solution
          </p>
        </div>

        {/* Contract Info Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {contractInfo ? (
            <>
              <div className="card">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="text-gray-500 text-xs sm:text-sm font-semibold mb-2">
                  Total Products
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {contractInfo.totalProducts}
                </p>
              </div>
              <div className="card">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="text-gray-500 text-xs sm:text-sm font-semibold mb-2">
                  Total Users
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {contractInfo.totalUsers}
                </p>
              </div>
              <div className="card">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-gray-500 text-xs sm:text-sm font-semibold mb-2">
                  Your Role
                </h3>
                <p className="text-lg sm:text-xl font-bold text-purple-600">
                  {userRole || "Not Registered"}
                </p>
              </div>
              <div className="card">
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="text-gray-500 text-xs sm:text-sm font-semibold mb-2">
                  Network
                </h3>
                <p className="text-lg sm:text-xl font-bold text-purple-600">
                  Sepolia
                </p>
              </div>
            </>
          ) : (
            <div className="col-span-full text-center py-6">
              <p className="text-gray-600">Loading contract information...</p>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card hover:shadow-lg transition">
            <h3 className="text-lg sm:text-xl font-bold mb-3">📦 Register Products</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Manufacturers can register new products with unique IDs and detailed information
            </p>
          </div>
          <div className="card hover:shadow-lg transition">
            <h3 className="text-lg sm:text-xl font-bold mb-3">🚚 Transfer Products</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Transfer products through the supply chain with complete tracked history
            </p>
          </div>
          <div className="card hover:shadow-lg transition">
            <h3 className="text-lg sm:text-xl font-bold mb-3">✓ Verify Products</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Complete audit trail and verification of product authenticity and legitimacy
            </p>
          </div>
        </div>

        {/* Supply Chain Flow */}
        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Supply Chain Flow</h2>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm sm:text-base">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
              <span className="text-xl">🏭</span>
              <span className="font-semibold">Manufacturer</span>
            </div>
            <div className="flex items-center gap-2">→</div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
              <span className="text-xl">🚚</span>
              <span className="font-semibold">Distributor</span>
            </div>
            <div className="flex items-center gap-2">→</div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
              <span className="text-xl">🏪</span>
              <span className="font-semibold">Retailer</span>
            </div>
            <div className="flex items-center gap-2">→</div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
              <span className="text-xl">👤</span>
              <span className="font-semibold">Customer</span>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="card">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Product Status Lifecycle</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(STATUS_NAMES).map(([key, status]) => (
              <div key={key} className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[status] }}
                ></div>
                <span className="font-semibold text-sm sm:text-base">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
