// Middleware to protect routes
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    //console.log("1. Middleware received token:", token); // Log 1

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("2. Token decoded successfully:", decoded); // Log 2

    const user = await User.findById(decoded.userId).select("-password");
    //console.log("3. User found in database:", user); // Log 3

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    req.user = user;
    //console.log("4. User attached to req.user. Proceeding..."); // Log 4
    next();
  } catch (error) {
    console.error("ERROR in protectRoute:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Token is not valid." });
  }
};
