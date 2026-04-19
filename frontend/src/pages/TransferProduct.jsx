import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { STATUS_NAMES } from "../config";
import { validations } from "../utils/validations";

export default function TransferProduct() {
  const { contract, isConnected, setError } = useWeb3();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    productId: "",
    newOwner: "",
    status: "1",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (isConnected && contract) {
      fetchMyProducts();
    }
  }, [isConnected, contract]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const count = await contract.getProductCount();
      const myProducts = [];

      for (let i = 0; i < count; i++) {
        try {
          const product = await contract.getProduct(i);
          const signer = contract.runner;
          const userAddr = await signer.getAddress();
          if (product.currentOwner === userAddr) {
            myProducts.push({
              ...product,
              id: product.id.toString(),
            });
          }
        } catch (err) {
          // Product might not exist
        }
      }

      setProducts(myProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let validation;
    switch (name) {
      case "productId":
        validation = validations.isValidProductId(value);
        break;
      case "newOwner":
        if (!value) {
          validation = { valid: false, error: "Address is required" };
        } else if (!validations.isValidAddress(value)) {
          validation = { valid: false, error: "Invalid Ethereum address format" };
        } else {
          validation = { valid: true, error: null };
        }
        break;
      case "status":
        validation = validations.isValidStatus(value);
        break;
      case "location":
        validation = validations.isValidLocation(value);
        break;
      case "notes":
        validation = validations.isValidNotes(value);
        break;
      default:
        validation = { valid: true, error: null };
    }
    return validation;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const validation = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: validation.error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const validation = validateField(name, formData[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: validation.error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const fieldsToValidate = ["productId", "newOwner", "status", "location"];

    fieldsToValidate.forEach((key) => {
      const validation = validateField(key, formData[key]);
      if (!validation.valid) {
        newErrors[key] = validation.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix all validation errors");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const tx = await contract.transferProduct(
        parseInt(formData.productId),
        formData.newOwner,
        parseInt(formData.status),
        formData.location.trim(),
        formData.notes.trim()
      );

      const receipt = await tx.wait();
      setSuccess(
        `✓ Product transferred successfully! Transaction: ${receipt.hash.slice(0, 10)}...`
      );
      setFormData({
        productId: "",
        newOwner: "",
        status: "1",
        location: "",
        notes: "",
      });
      setErrors({});
      setTouched({});
      await fetchMyProducts();
    } catch (error) {
      console.error("Error transferring product:", error);
      setError(error.reason || error.message || "Failed to transfer product");
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Transfer Product</h1>
        <p className="text-gray-600 mb-6">Move products to the next participant in the supply chain</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form - Takes 2 columns on large screens */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 card space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Select Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field w-full ${
                  errors.productId && touched.productId
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              >
                <option value="">Choose a product...</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} (ID: {prod.id}) - {STATUS_NAMES[prod.status]}
                  </option>
                ))}
              </select>
              {errors.productId && touched.productId && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.productId}</p>
              )}
              {products.length === 0 && (
                <p className="text-gray-500 text-sm mt-1">
                  No products available to transfer
                </p>
              )}
            </div>

            {/* New Owner Address */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                New Owner Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="newOwner"
                value={formData.newOwner}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0x..."
                maxLength="42"
                className={`input-field w-full font-mono text-sm ${
                  errors.newOwner && touched.newOwner
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              />
              {errors.newOwner && touched.newOwner && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.newOwner}</p>
              )}
              {!errors.newOwner && touched.newOwner && (
                <p className="text-green-600 text-sm mt-1">✓ Valid address</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field w-full ${
                  errors.status && touched.status ? "border-red-500 bg-red-50" : ""
                }`}
              >
                {Object.entries(STATUS_NAMES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.status && touched.status && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.status}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Distribution Center, Warehouse B"
                maxLength="100"
                className={`input-field w-full ${
                  errors.location && touched.location
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              />
              {errors.location && touched.location && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.location}</p>
              )}
              {!errors.location && touched.location && (
                <p className="text-green-600 text-sm mt-1">✓ Valid</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Transfer Notes <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Additional transfer information"
                rows="3"
                maxLength="300"
                className={`input-field w-full resize-none ${
                  errors.notes && touched.notes ? "border-red-500 bg-red-50" : ""
                }`}
              />
              {errors.notes && touched.notes && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.notes}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.notes.length}/300 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || Object.values(errors).some((e) => e)}
              className="btn disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 text-lg"
            >
              {loading ? "Transferring..." : "Transfer Product"}
            </button>
          </form>

          {/* Sidebar - My Products List */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Your Products</h2>
              {products.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No products available to transfer
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          productId: prod.id,
                        }));
                      }}
                      className="p-3 bg-gray-100 hover:bg-purple-100 rounded border-l-4 border-purple-600 cursor-pointer transition"
                    >
                      <p className="font-semibold text-sm">{prod.name}</p>
                      <p className="text-xs text-gray-600">ID: {prod.id}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        📍 {prod.location}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-200 text-purple-700 rounded text-xs font-semibold">
                        {STATUS_NAMES[prod.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {success && (
          <div className="alert-success mt-6 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <strong>Success!</strong>
            </div>
            <p className="text-sm mt-1">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
}
