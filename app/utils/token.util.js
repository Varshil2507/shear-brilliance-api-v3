const jwt = require('jsonwebtoken');



// Function to generate a token
const generateToken = (userId) => {
  const payload = { id: userId };
  const token = jwt.sign(payload, secretKey, { expiresIn: '365d' }); // Token expires in 1 hour
  
  return token;
};

module.exports = { generateToken };
