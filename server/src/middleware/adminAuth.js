/**
 * Simple token-based admin guard.
 * Set ADMIN_TOKEN in .env — requests must send:
 *   Authorization: Bearer <token>
 * or query param ?token=<token>
 */
const adminAuth = (req, res, next) => {
  const token = process.env.ADMIN_TOKEN || 'vtu-admin-2024';
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  const query  = req.query.token;

  if (bearer === token || query === token) return next();

  return res.status(401).json({ success: false, message: 'Unauthorized' });
};

module.exports = adminAuth;
