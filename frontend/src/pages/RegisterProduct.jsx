import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { validations } from "../utils/validations";

export default function RegisterProduct() {
  const { contract, isConnected, setError } = useWeb3();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const validateField = (name, value) => {
    let validation;
    switch (name) {
      case "name":
        validation = validations.isValidProductName(value);
        break;
      case "description":
        validation = validations.isValidDescription(value);
        break;
      case "location":
        validation = validations.isValidLocation(value);
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

    // Real-time validation
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

    Object.keys(formData).forEach((key) => {
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

      const tx = await contract.registerProduct(
        formData.name.trim(),
        formData.description.trim(),
        formData.location.trim()
      );

      const receipt = await tx.wait();
      setSuccess(
        `✓ Product registered successfully! Transaction: ${receipt.hash.slice(0, 10)}...`
      );
      setFormData({ name: "", description: "", location: "" });
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Error registering product:", error);
      setError(error.reason || error.message || "Failed to register product");
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Register New Product
        </h1>
        <p className="text-gray-600 mb-6">Add a new product to the supply chain</p>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Laptop, Smartphone"
              maxLength="50"
              className={`input-field w-full ${
                errors.name && touched.name ? "border-red-500 bg-red-50" : ""
              }`}
            />
            {errors.name && touched.name && (
              <p className="text-red-600 text-sm mt-1">✗ {errors.name}</p>
            )}
            {!errors.name && touched.name && (
              <p className="text-green-600 text-sm mt-1">✓ Valid</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Detailed product description"
              rows="4"
              maxLength="500"
              className={`input-field w-full resize-none ${
                errors.description && touched.description
                  ? "border-red-500 bg-red-50"
                  : ""
              }`}
            />
            {errors.description && touched.description && (
              <p className="text-red-600 text-sm mt-1">✗ {errors.description}</p>
            )}
            {!errors.description && touched.description && (
              <p className="text-green-600 text-sm mt-1">✓ Valid</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Manufacturing Location */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Manufacturing Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Shanghai Factory, Building A"
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
            <p className="text-gray-500 text-sm mt-1">
              {formData.location.length}/100 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || Object.values(errors).some((e) => e)}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 text-lg"
          >
            {loading ? "Registering..." : "Register Product"}
          </button>
        </form>

        {success && (
          <div className="alert-success mt-6 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <strong>Success!</strong>
            </div>
            <p className="text-sm mt-1">{success}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="card mt-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Product name should be clear and descriptive</li>
            <li>• Include specifications, model, and batch info in description</li>
            <li>• Manufacturing location helps with supply chain tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
