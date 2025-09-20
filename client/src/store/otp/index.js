import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Base URL - adjust according to your setup
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Async Thunks for API calls

// Send OTP
export const sendOTP = createAsyncThunk(
  'otp/sendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return { ...data, email }; // Include email in success response
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Network error. Please check your connection.',
        error: error.message,
      });
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'otp/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return { ...data, email };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Network error. Please check your connection.',
        error: error.message,
      });
    }
  }
);

// Resend OTP
export const resendOTP = createAsyncThunk(
  'otp/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/otp/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return { ...data, email };
    } catch (error) {
      return rejectWithValue({
        success: false,
        message: 'Network error. Please check your connection.',
        error: error.message,
      });
    }
  }
);

// Initial State
const initialState = {
  // Loading states
  isSending: false,
  isVerifying: false,
  isResending: false,
  
  // Data
  email: null,
  userId: null,
  isOTPSent: false,
  isOTPVerified: false,
  
  // Messages
  sendMessage: '',
  verifyMessage: '',
  resendMessage: '',
  
  // Errors
  sendError: null,
  verifyError: null,
  resendError: null,
  
  // UI helpers
  showResendButton: false,
  resendCooldown: 0, // seconds remaining
  attemptCount: 0,
  maxAttempts: 3,
};

// OTP Slice
const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    // Clear all OTP state
    clearOTPState: (state) => {
      return { ...initialState };
    },
    
    // Clear specific errors
    clearSendError: (state) => {
      state.sendError = null;
    },
    
    clearVerifyError: (state) => {
      state.verifyError = null;
    },
    
    clearResendError: (state) => {
      state.resendError = null;
    },
    
    // Clear all errors
    clearAllErrors: (state) => {
      state.sendError = null;
      state.verifyError = null;
      state.resendError = null;
    },
    
    // Clear all messages
    clearAllMessages: (state) => {
      state.sendMessage = '';
      state.verifyMessage = '';
      state.resendMessage = '';
    },
    
    // Set email
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    
    // Show resend button after delay
    showResendButton: (state) => {
      state.showResendButton = true;
    },
    
    // Hide resend button
    hideResendButton: (state) => {
      state.showResendButton = false;
    },
    
    // Update resend cooldown
    updateResendCooldown: (state, action) => {
      state.resendCooldown = action.payload;
    },
    
    // Reset attempt count
    resetAttemptCount: (state) => {
      state.attemptCount = 0;
    },
    
    // Increment attempt count
    incrementAttemptCount: (state) => {
      state.attemptCount += 1;
    },
  },
  
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.isSending = true;
        state.sendError = null;
        state.sendMessage = '';
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.isSending = false;
        state.isOTPSent = true;
        state.email = action.payload.email;
        state.sendMessage = action.payload.message;
        state.showResendButton = false;
        state.resendCooldown = 60; // 60 seconds cooldown
        state.attemptCount = 0;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isSending = false;
        state.isOTPSent = false;
        state.sendError = action.payload?.message || 'Failed to send OTP';
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isVerifying = true;
        state.verifyError = null;
        state.verifyMessage = '';
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.isOTPVerified = true;
        state.userId = action.payload.userId;
        state.verifyMessage = action.payload.message;
        state.attemptCount = 0;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isVerifying = false;
        state.isOTPVerified = false;
        state.verifyError = action.payload?.message || 'Failed to verify OTP';
        state.attemptCount += 1;
        
        // Show resend button after max attempts
        if (state.attemptCount >= state.maxAttempts) {
          state.showResendButton = true;
        }
      });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.isResending = true;
        state.resendError = null;
        state.resendMessage = '';
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.isResending = false;
        state.isOTPSent = true;
        state.resendMessage = action.payload.message;
        state.showResendButton = false;
        state.resendCooldown = 60; // Reset cooldown
        state.attemptCount = 0; // Reset attempts
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isResending = false;
        state.resendError = action.payload?.message || 'Failed to resend OTP';
      });
  },
});

// Export actions
export const {
  clearOTPState,
  clearSendError,
  clearVerifyError,
  clearResendError,
  clearAllErrors,
  clearAllMessages,
  setEmail,
  showResendButton,
  hideResendButton,
  updateResendCooldown,
  resetAttemptCount,
  incrementAttemptCount,
} = otpSlice.actions;

// Selectors
export const selectOTP = (state) => state.otp;
export const selectIsSending = (state) => state.otp.isSending;
export const selectIsVerifying = (state) => state.otp.isVerifying;
export const selectIsResending = (state) => state.otp.isResending;
export const selectIsOTPSent = (state) => state.otp.isOTPSent;
export const selectIsOTPVerified = (state) => state.otp.isOTPVerified;
export const selectEmail = (state) => state.otp.email;
export const selectUserId = (state) => state.otp.userId;
export const selectSendMessage = (state) => state.otp.sendMessage;
export const selectVerifyMessage = (state) => state.otp.verifyMessage;
export const selectResendMessage = (state) => state.otp.resendMessage;
export const selectSendError = (state) => state.otp.sendError;
export const selectVerifyError = (state) => state.otp.verifyError;
export const selectResendError = (state) => state.otp.resendError;
export const selectShowResendButton = (state) => state.otp.showResendButton;
export const selectResendCooldown = (state) => state.otp.resendCooldown;
export const selectAttemptCount = (state) => state.otp.attemptCount;
export const selectMaxAttempts = (state) => state.otp.maxAttempts;
export const selectCanResend = (state) => state.otp.showResendButton && state.otp.resendCooldown === 0;
export const selectIsLoading = (state) => state.otp.isSending || state.otp.isVerifying || state.otp.isResending;

// Export reducer
export default otpSlice.reducer;