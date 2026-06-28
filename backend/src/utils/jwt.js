const jwt = require('jsonwebtoken');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    queryCount: user.queryCount,
    createdAt: user.createdAt
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj
  });
};

module.exports = { signToken, verifyToken, createSendToken };
