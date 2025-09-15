import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js"; // Model created for DB
import bcrypt from "bcryptjs";

//Sign up a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  console.log(req.body);
  try {
    // Check for missing fields
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account Already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user in DB
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    // Generate token
    const token = generateToken(newUser._id);
    console.log(token);

    // Return response (excluding password for safety)
    res.json({
      success: true,
      userData: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        bio: newUser.bio,
      },
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to login a User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userData = await User.findOne({ email });
    console.log(userData);

    if (!userData) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // Generate token
    const token = generateToken(userData._id);

    // Send safe user data (no password)
    return res.json({
      success: true,
      userData: {
        _id: userData._id,
        fullName: userData.fullName,
        email: userData.email,
        bio: userData.bio,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to check if user is Authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// Controller to update user profile details

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    if (!fullName || !bio) {
      return res
        .status(400)
        .json({ success: false, message: "Full Name and Bio are required" });
    }

    let updatedUser;
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "user_profiles",
      });
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
