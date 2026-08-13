const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header
      const token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } else {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ message: "Not authorized, token is invalid" });
  }
};

// Restrict access to specific roles (e.g., authorize("admin", "project_manager"))
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user?.role}' is not authorized.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
