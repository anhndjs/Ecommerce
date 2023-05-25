const jwt = require('jsonwebtoken');

const generateRefreshTokenToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });

module.exports = { generateRefreshTokenToken };
