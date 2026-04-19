import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ROLE_NAMES, STATUS_NAMES } from "../config";
import { validations } from "../utils/validations";

export default function ProductHistory() {
  const { contract, isConnected, setError } = useWeb3();
  const [productId, setProductId] = useState("");
  const [productIdError, setProductIdError] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthentic, setIsAuthentic] = useState(null);

  const handleProductIdChange = (e) => {
    const value = e.target.value;
    setProductId(value);

    // Real-time validation
    if (value) {
      const validation = validations.isValidProductId(value);
      setProductIdError(validation.error);
    } else {
      setProductIdError(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const validation = validations.isValidProductId(productId);
    if (!validation.valid) {
      setError(validation.error);
      setProductIdError(validation.error);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHistory(null);
      setIsAuthentic(null);
      setProductIdError(null);

      const historyData = await contract.getProductHistory(parseInt(productId));
      const authentic = await contract.verifyProductAuthenticity(
        parseInt(productId)
      );

      setHistory(historyData);
      setIsAuthentic(authentic);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError(error.reason || "Product not found or error fetching history");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="card w-full max-w-md text-center">
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-gray-600 text-lg">Please connect your wallet first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Product History & Verification
        </h1>
        <p className="text-gray-600 mb-6">
          Track the complete supply chain journey and verify product authenticity
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="card mb-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Product ID <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={productId}
                  onChange={handleProductIdChange}
                  placeholder="Enter Product ID"
                  className={`input-field w-full ${
                    productIdError ? "border-red-500 bg-red-50" : ""
                  }`}
                />
                {productIdError && (
                  <p className="text-red-600 text-sm mt-1">✗ {productIdError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !productId || productIdError}
                className="btn disabled:opacity-50 disabled:cursor-not-allowed px-6 sm:px-8 py-2 whitespace-nowrap"
              >
                {loading ? "Searching..." : "🔍 Search"}
              </button>
            </div>
          </div>
        </form>

        {/* Authentication Status */}
        {isAuthentic !== null && (
          <div
            className={`p-4 rounded-lg mb-6 border-l-4 ${
              isAuthentic
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-red-50 border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{isAuthentic ? "✓" : "✗"}</span>
              <strong className="text-lg">
                {isAuthentic ? "Authentic Product" : "Not Authentic"}
              </strong>
            </div>
            <p className="text-sm">
              {isAuthentic
                ? "✓ Product has a valid and complete supply chain history"
                : "✗ Product chain validation failed - possible tampering detected"}
            </p>
          </div>
        )}

        {/* History Timeline */}
        {history && history.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Supply Chain Journey</h2>
              <span className="text-gray-500">({history.length} record{history.length !== 1 ? "s" : ""})</span>
            </div>

            {/* Timeline visualization */}
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600"></div>

              {/* Timeline items */}
              <div className="space-y-4">
                {history.map((record, index) => (
                  <div key={index} className="md:ml-20 card border-l-4 md:border-l-0 border-purple-600">
                    {/* Timeline dot for desktop */}
                    <div className="hidden md:block absolute -left-7 top-4 w-12 h-12 bg-white border-4 border-purple-600 rounded-full flex items-center justify-center font-bold text-purple-600">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      {/* Step indicator for mobile */}
                      <div className="md:hidden flex items-center gap-2">
                        <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs text-gray-500">Step {index + 1}</span>
                      </div>

                      {/* Actor and Role */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">Actor</p>
                          <div className="space-y-1">
                            <p className="font-bold text-lg text-purple-600">
                              {ROLE_NAMES[record.actorRole] || "Unknown"}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                              {formatAddress(record.actor)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">Status</p>
                          <p className="text-lg sm:text-xl font-bold text-purple-600">
                            {STATUS_NAMES[record.status] || "Unknown"}
                          </p>
                        </div>
                      </div>

                      {/* Location and Timestamp */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">📍 Location</p>
                          <p className="font-semibold">{record.location}</p>
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">🕐 Timestamp</p>
                          <div className="text-sm">
                            <p className="font-semibold">
                              {new Date(parseInt(record.timestamp) * 1000).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {record.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">📝 Notes</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {record.notes}
                          </p>
                        </div>
                      )}

                      {/* Connection to next */}
                      {index < history.length - 1 && (
                        <div className="hidden md:flex justify-center py-2">
                          <div className="text-gray-400">↓</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Card */}
            <div className="card bg-blue-50 border border-blue-200 mt-8">
              <h3 className="font-bold text-blue-900 mb-3">📊 Supply Chain Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 text-xs mb-1">Total Transfers</p>
                  <p className="font-bold text-lg text-blue-900">{history.length}</p>
                </div>
                <div>
                  <p className="text-blue-700 text-xs mb-1">First Transfer</p>
                  <p className="font-bold text-sm text-blue-900">
                    {history.length > 0
                      ? new Date(parseInt(history[0].timestamp) * 1000).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 text-xs mb-1">Final Status</p>
                  <p className="font-bold text-sm text-blue-900">
                    {history.length > 0
                      ? STATUS_NAMES[history[history.length - 1].status]
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : history !== null ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-600">No history found for this product</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
