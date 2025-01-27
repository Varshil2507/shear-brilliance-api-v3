const validateAddress = (address) => {
    // Check if address is undefined or empty
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
        return 'Address cannot be empty.';
    }
  
    // Check if address contains only digits
    if (/^\d+$/.test(address)) {
        return 'Address cannot contain only digits.';
    }
  
    // Check for minimum length (e.g., at least 5 characters)
    if (address.length < 5) {
        return 'Address is too short. Please provide a valid address.';
    }
  
    // Universal regex to validate a wide range of address formats
    const universalAddressRegex = /^[a-zA-Z0-9\s,./\-#'&áéíóúüñçÀ-ÿ]{5,}$/;
    if (!universalAddressRegex.test(address)) {
        return 'Address format is invalid. Please provide a valid address.';
    }
  
    // If all checks pass
    return null;
  };
  

const validateInput = (input, type) => {
  const validators = {
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      password: (value) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
      whitespace: (value) => value.trim().length > 0,
      mobile_number: (value) => {
          const cleanValue = value.replace(/\D/g, '').trim(); // Remove non-numeric characters and trim spaces
          const mobileRegex = /^(\+?\d{1,3})?(?!0+$)\d{10}$/; // Allow optional country code
          return mobileRegex.test(cleanValue);
      },
      phone_number: (value) => {
          const cleanValue = value.replace(/\D/g, '').trim(); // Remove non-numeric characters and trim spaces
          const mobileRegex = /^(\+?\d{1,3})?(?!0+$)\d{10}$/; // Allow optional country code
          return mobileRegex.test(cleanValue);
      },
      address: (value) => {
          const errorMessage = validateAddress(value);
          return errorMessage === null; // Return true if no error message; otherwise, false
      },
      // Regular expression to validate names (only letters, spaces allowed)
      nameRegex : (value) => /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(value),
  };

  return validators[type] ? validators[type](input) : false;
};

module.exports = validateInput;
