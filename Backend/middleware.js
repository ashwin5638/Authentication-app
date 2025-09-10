const jwt = require("jsonwebtoken");
const User = require("./models/User");


const authMiddleware = async (req, res, next) => {
  try {
  
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");


    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { authMiddleware, isAdmin };
