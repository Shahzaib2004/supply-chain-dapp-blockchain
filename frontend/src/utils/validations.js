// Validation utilities for forms

export const validations = {
  // Ethereum address validation
  isValidAddress: (address) => {
    if (!address) return false;
    if (!address.startsWith("0x")) return false;
    if (address.length !== 42) return false;
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  },

  // Product name validation
  isValidProductName: (name) => {
    if (!name) return { valid: false, error: "Product name is required" };
    if (name.trim().length < 2)
      return { valid: false, error: "Name must be at least 2 characters" };
    if (name.trim().length > 50)
      return { valid: false, error: "Name must not exceed 50 characters" };
    return { valid: true, error: null };
  },

  // Description validation
  isValidDescription: (description) => {
    if (!description) return { valid: false, error: "Description is required" };
    if (description.trim().length < 10)
      return {
        valid: false,
        error: "Description must be at least 10 characters",
      };
    if (description.trim().length > 500)
      return {
        valid: false,
        error: "Description must not exceed 500 characters",
      };
    return { valid: true, error: null };
  },

  // Location validation
  isValidLocation: (location) => {
    if (!location) return { valid: false, error: "Location is required" };
    if (location.trim().length < 3)
      return { valid: false, error: "Location must be at least 3 characters" };
    if (location.trim().length > 100)
      return { valid: false, error: "Location must not exceed 100 characters" };
    return { valid: true, error: null };
  },

  // Organization name validation
  isValidOrganization: (org) => {
    if (!org) return { valid: false, error: "Organization name is required" };
    if (org.trim().length < 2)
      return {
        valid: false,
        error: "Organization must be at least 2 characters",
      };
    if (org.trim().length > 100)
      return {
        valid: false,
        error: "Organization must not exceed 100 characters",
      };
    return { valid: true, error: null };
  },

  // Notes validation
  isValidNotes: (notes) => {
    if (!notes) return { valid: true, error: null }; // Optional field
    if (notes.trim().length > 300)
      return {
        valid: false,
        error: "Notes must not exceed 300 characters",
      };
    return { valid: true, error: null };
  },

  // Product ID validation
  isValidProductId: (productId) => {
    if (!productId) return { valid: false, error: "Product ID is required" };
    if (isNaN(productId) || parseInt(productId) < 0)
      return { valid: false, error: "Product ID must be a valid number" };
    return { valid: true, error: null };
  },

  // Status validation
  isValidStatus: (status) => {
    if (status === null || status === undefined)
      return { valid: false, error: "Status is required" };
    if (isNaN(status) || status < 0 || status > 3)
      return { valid: false, error: "Invalid status value" };
    return { valid: true, error: null };
  },

  // Role validation
  isValidRole: (role) => {
    if (role === null || role === undefined)
      return { valid: false, error: "Role is required" };
    if (isNaN(role) || role < 0 || role > 3)
      return { valid: false, error: "Invalid role value" };
    return { valid: true, error: null };
  },

  // Generic text field validation
  isValidTextField: (value, minLength = 1, maxLength = 255, fieldName = "Field") => {
    if (!value && minLength > 0)
      return { valid: false, error: `${fieldName} is required` };
    if (value && value.length < minLength)
      return {
        valid: false,
        error: `${fieldName} must be at least ${minLength} characters`,
      };
    if (value && value.length > maxLength)
      return {
        valid: false,
        error: `${fieldName} must not exceed ${maxLength} characters`,
      };
    return { valid: true, error: null };
  },
};

export default validations;
