const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'play_companion_secret_key_2024';

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ code: 401, msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ code: 401, msg: 'Token is not valid' });
    }
};
