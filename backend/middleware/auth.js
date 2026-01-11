import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const isDonator = (req, res, next) => {
  // Check if the role is 'donator' (matches your User model enum)
  if (req.user.role !== 'donator') {
    return res.status(403).json({ 
      success: false, 
      message: "Access Denied: Only Donors are authorized to post donations." 
    });
  }
  next();
};

export const isReceiver = (req, res, next) => {
  if (req.user.role !== 'receiver') {
    return res.status(403).json({ 
      success: false, 
      message: "Access Denied: Only NGOs/Receivers can perform this action." 
    });
  }
  next();
};