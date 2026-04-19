import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { STATUS_NAMES } from "../config";

export default function ViewProducts() {
  const { contract, isConnected } = useWeb3();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isConnected && contract) {
      fetchProducts();
    }
  }, [isConnected, contract]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const count = await contract.getProductCount();
      const allProducts = [];

      for (let i = 0; i < count; i++) {
        try {
          const product = await contract.getProduct(i);
          allProducts.push({
            ...product,
            id: product.id.toString(),
          });
        } catch (err) {
          // Skip inaccessible products
        }
      }

      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.includes(searchTerm) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">All Products</h1>
            <p className="text-gray-600">Total: {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="btn-secondary px-6 py-2 text-center disabled:opacity-50"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Search Box */}
        <div className="card mb-6">
          <input
            type="text"
            placeholder="Search by name, ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-600 text-lg">
              {products.length === 0 ? "No products found" : "No products match your search"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <div className="table-container">
                <table className="table w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="text-left px-4 py-3">ID</th>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Description</th>
                      <th className="text-left px-4 py-3">Owner</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Location</th>
                      <th className="text-left px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold">{product.id}</td>
                        <td className="px-4 py-3 font-semibold">{product.name}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">
                          {product.description}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                            {formatAddress(product.currentOwner)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                            {STATUS_NAMES[product.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">{product.location}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(parseInt(product.createdAt) * 1000).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Product ID</p>
                      <p className="font-bold text-lg">{product.name}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold whitespace-nowrap">
                      {STATUS_NAMES[product.status]}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {product.description.substring(0, 100)}
                    {product.description.length > 100 ? "..." : ""}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Owner</p>
                      <p className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {formatAddress(product.currentOwner)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-semibold">{product.location}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Created: {new Date(parseInt(product.createdAt) * 1000).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
