const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "pmss-secret-change-me";

function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

module.exports = { sign, requireAuth, requireRole };
