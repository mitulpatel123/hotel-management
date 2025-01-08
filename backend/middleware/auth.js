const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const verifyPin = (req, res, next) => {
  const { pin } = req.body;
  
  if (!pin || pin !== process.env.PROPERTY_PIN) {
    return res.status(401).json({ message: 'Invalid Property PIN' });
  }
  
  next();
};

module.exports = { auth, adminOnly, verifyPin };
