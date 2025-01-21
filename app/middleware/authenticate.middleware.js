const jwt = require('jsonwebtoken');
const secretKey = require('../config/jwt.config').secret; // Import the secret key

// Middleware to authenticate JWT tokens
exports.authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Token:', token); // Debugging line
    if (!token) {
        req.user = null;
        console.log('No token provided'); // Debugging line
        return next();
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err); // Debugging line
            return res.sendStatus(403);
        }
        req.user = user;
        console.log('Token verified, user:', user); // Debugging line
        
        next();
    });
};



