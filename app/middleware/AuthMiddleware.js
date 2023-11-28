// authMiddleware.js
const jwt = require('jsonwebtoken');
const { problemResponse } = require('../helpers/response');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json(problemResponse("No token provided", null, 401));
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, decoded) => {
        if (err) {
            return res.status(403).json(problemResponse("Forbidden, invalid token", null, 403));
        }
        req.user = decoded;
        next();
    });
}
module.exports = authenticateToken;
