const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  authMiddleware,
  deleteAccount,
  changePassword,
  refreshAccessToken
} = require("../controllers/auth-controller");
const User = require('../models/User');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google-login", googleLogin);
router.delete("/delete-account", authMiddleware, deleteAccount);
router.post("/setnewpassword", authMiddleware, changePassword);

router.post("/refresh", refreshAccessToken);

router.get("/check-auth", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user: {
        id: user._id,
        email: user.email,
        userName: user.name,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

module.exports = router;
