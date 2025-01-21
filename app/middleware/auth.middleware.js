const jwt = require('jsonwebtoken');
const secretKey = require('../config/jwt.config').secret;
const roles = require('../config/roles.config').role;

const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: "Access denied, token missing!" });
    }

    try {
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                console.log('Token verification failed:', err);
                return res.sendStatus(403);
            }
            req.user = user; // `user` now includes the role from the token
            console.log('Token verified, user:', user);
            next();
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware for role-based access
const authorizeRoles = (...allowedRoles) => { 
    return (req, res, next) => {
        const { user } = req;
        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: "Access denied: insufficient role permissions." });
        }
        next();
    };
};

module.exports = { authenticateJWT, authorizeRoles };
