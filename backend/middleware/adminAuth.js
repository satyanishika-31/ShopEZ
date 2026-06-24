export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Administrator privileges required' });
  }
};

export const sellerOrAdmin = (req, res, next) => {
  if (req.user && ['SELLER', 'ADMIN'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Seller or administrator privileges required' });
  }
};
