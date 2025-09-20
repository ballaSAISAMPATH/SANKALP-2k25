const User = require('../models/User');
const jwt = require("jsonwebtoken");
const admin = require('firebase-admin');
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});

// Generate Tokens
function generateTokens(user) {
  const payload = {
    id: user._id,
    email: user.email,
    tokenVersion: user.tokenVersion  
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY,{ expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: "7d" });

  return { accessToken, refreshToken };
}

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const check = await User.findOne({ email });
    if (check) {
      return res.status(200).json({
        success: false,
        message: "User already exists!",
      });
    }

    const newUser = new User({
      name: userName,
      email,
      password,
      authProvider: 'email',
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered",
    });
  } catch (error) {
    console.error("Register User error:", error);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        message: "Logged in successfully",
        accessToken,
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
    console.log(error);
    
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};


const googleLogin = async (req, res) => {
  const { idToken, email, name, photoURL, uid } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.uid !== uid) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        firebaseUid: uid,
        profilePicture: photoURL,
        authProvider: "google",
      });
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Logged in with Google",
        accessToken,
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
    console.log(error);
    
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({ success: false, message: "Refresh token revoked" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};


const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  }).json({
    success: true,
    message: "Logged out successfully!",
  });
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).json({ success: false, message: "Token revoked" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};


const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.body; 
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Optional: Update login history to mark user as deleted
    try {
      await LoginHistory.updateMany(
        { userId: userId },
        { $set: { isUserDeleted: true } }
      );
    } catch (historyError) {
      console.error('Error updating login history on user deletion:', historyError);
      // Don't fail the deletion if history update fails
    }

    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account. Please try again.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, old password, and new password are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }


    if (oldPassword !== user.password) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    await User.findByIdAndUpdate(userId, {
        password: newPassword,
        $inc: { tokenVersion: 1 }  
      });


    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      payload: {
        message: 'Password updated successfully'
      }
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  googleLogin,
  deleteAccount,
  changePassword,
  refreshAccessToken
};