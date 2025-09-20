const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User')
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otpCode = generateOTP();
    
    await User.findByIdAndUpdate(user._id, {
      otp: {
        code: otpCode,
      }
    });

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'AI TaskFlow',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'AI TaskFlow - Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">AI TaskFlow</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">AI-Powered Task Management</p>
            </div>
            
            <h2 style="color: #334155; text-align: center; margin-bottom: 20px;">Email Verification</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">
              Your One-Time Password (OTP) for AI TaskFlow email verification is:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 25px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
                ${otpCode}
              </span>
            </div>
            
            <div style="background-color: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                ⚠️ Security Notice: This OTP will expire in 10 minutes. Please do not share this code with anyone.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
              If you didn't request this verification, please ignore this email or contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                This email was sent by AI TaskFlow - AI-Powered Task Management System
              </p>
            </div>
          </div>
        </div>
      `,
      text: `AI TaskFlow - Your OTP verification code is: ${otpCode}. This code will expire in 10 minutes. Do not share this code with anyone.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ 
      email,
      'otp.code': otp 
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or email'
      });
    }

    await User.findByIdAndUpdate(user._id, {
      $unset: { otp: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      userId: user._id
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otpCode = generateOTP();
    
    await User.findByIdAndUpdate(user._id, {
      otp: {
        code: otpCode,
      }
    });

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'AI TaskFlow',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'AI TaskFlow - Your New OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">AI TaskFlow</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">AI-Powered Task Management</p>
            </div>
            
            <h2 style="color: #334155; text-align: center; margin-bottom: 20px;">Email Verification - Resent</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">
              Your new One-Time Password (OTP) for AI TaskFlow email verification is:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 15px 25px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
                ${otpCode}
              </span>
            </div>
            
            <div style="background-color: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                ⚠️ Security Notice: This OTP will expire in 10 minutes. Please do not share this code with anyone.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
              If you didn't request this verification, please ignore this email or contact our AI TaskFlow support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                This email was sent by AI TaskFlow - AI-Powered Task Management System
              </p>
            </div>
          </div>
        </div>
      `,
      text: `AI TaskFlow - Your new OTP verification code is: ${otpCode}. This code will expire in 10 minutes. Do not share this code with anyone.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully to your email',
    });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const changePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error changing password" });
  }
};


module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  changePassword
};