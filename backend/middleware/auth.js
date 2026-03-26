const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'fastlane-secret';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
