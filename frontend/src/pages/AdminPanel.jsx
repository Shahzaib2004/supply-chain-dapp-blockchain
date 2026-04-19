import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ROLE_NAMES } from "../config";
import { validations } from "../utils/validations";

export default function AdminPanel() {
  const { contract, account, isConnected, setError } = useWeb3();
  const [formData, setFormData] = useState({
    userAddress: "",
    role: "0",
    organizationName: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  React.useEffect(() => {
    if (isConnected && contract && account) {
      checkOwner();
    }
  }, [isConnected, contract, account]);

  const checkOwner = async () => {
    try {
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error("Error checking owner:", error);
    }
  };

  const validateField = (name, value) => {
    let validation;
    switch (name) {
      case "userAddress":
        if (!value) {
          validation = { valid: false, error: "Address is required" };
        } else if (!validations.isValidAddress(value)) {
          validation = { valid: false, error: "Invalid Ethereum address format" };
        } else {
          validation = { valid: true, error: null };
        }
        break;
      case "organizationName":
        validation = validations.isValidOrganization(value);
        break;
      case "role":
        validation = validations.isValidRole(value);
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

  const handleRegisterUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix all validation errors");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const tx = await contract.registerUser(
        formData.userAddress,
        parseInt(formData.role),
        formData.organizationName.trim()
      );

      const receipt = await tx.wait();
      setSuccess(
        `✓ User registered successfully! Transaction: ${receipt.hash.slice(0, 10)}...`
      );
      setFormData({ userAddress: "", role: "0", organizationName: "" });
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Error registering user:", error);
      setError(error.reason || error.message || "Failed to register user");
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

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-md mx-auto">
          <div className="alert-error">
            <strong>🔒 Access Denied</strong>
            <p className="mt-2">Only the contract owner can access the admin panel</p>
            <p className="text-sm mt-2 text-red-700">
              Owner: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Unknown"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-600 mb-6">Manage users and supply chain participants</p>

        <div className="alert-info mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <strong>Owner Account Detected</strong>
          </div>
          <p className="text-sm mt-2">
            You have permission to register new users and manage the system
          </p>
        </div>

        {/* Register User Form */}
        <form onSubmit={handleRegisterUser} className="card space-y-6 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Register New User</h2>

            {/* User Wallet Address */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                User Wallet Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userAddress"
                value={formData.userAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0x..."
                className={`input-field w-full font-mono text-sm ${
                  errors.userAddress && touched.userAddress
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              />
              {errors.userAddress && touched.userAddress && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.userAddress}</p>
              )}
              {!errors.userAddress && touched.userAddress && (
                <p className="text-green-600 text-sm mt-1">✓ Valid address</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Format: 0x + 40 hex characters</p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field w-full ${
                  errors.role && touched.role ? "border-red-500 bg-red-50" : ""
                }`}
              >
                {Object.entries(ROLE_NAMES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.role && touched.role && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.role}</p>
              )}
            </div>

            {/* Organization Name */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Tech Supplies Inc"
                maxLength="100"
                className={`input-field w-full ${
                  errors.organizationName && touched.organizationName
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              />
              {errors.organizationName && touched.organizationName && (
                <p className="text-red-600 text-sm mt-1">✗ {errors.organizationName}</p>
              )}
              {!errors.organizationName && touched.organizationName && (
                <p className="text-green-600 text-sm mt-1">✓ Valid</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.organizationName.length}/100 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || Object.values(errors).some((e) => e)}
              className="btn disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 text-lg"
            >
              {loading ? "Registering..." : "Register User"}
            </button>
          </div>
        </form>

        {success && (
          <div className="alert-success mb-8 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <strong>Success!</strong>
            </div>
            <p className="text-sm mt-1">{success}</p>
          </div>
        )}

        {/* Info Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">Manufacturer</h3>
            <p className="text-sm text-blue-800">
              Can register and initiate products into the supply chain
            </p>
          </div>
          <div className="card bg-green-50 border border-green-200">
            <h3 className="font-bold text-green-900 mb-3">Distributor</h3>
            <p className="text-sm text-green-800">
              Receives products from Manufacturer, sends to Retailer
            </p>
          </div>
          <div className="card bg-yellow-50 border border-yellow-200">
            <h3 className="font-bold text-yellow-900 mb-3">Retailer</h3>
            <p className="text-sm text-yellow-800">
              Receives from Distributor, sells to end Customer
            </p>
          </div>
          <div className="card bg-purple-50 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-3">Customer</h3>
            <p className="text-sm text-purple-800">
              End consumer who receives the final product
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
