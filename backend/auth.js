const jwt = require('jsonwebtoken');

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  return jwt.sign(payload, secret, { expiresIn: '12h' });
}

function authMiddleware(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

module.exports = { signToken, authMiddleware, requireRole };
