import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios'

// Configure axios defaults
axios.defaults.withCredentials = true;

const initialData = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  accessToken: null
}

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, 
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }   
)

export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        formData
      );
      
      if (response.data.success && response.data.accessToken) {
        setAuthToken(response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google-login`, 
        userData
      );
      
      if (response.data.success && response.data.accessToken) {
        setAuthToken(response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Google login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`
      );
      
      // Clear token regardless of response
      setAuthToken(null);
      
      return response.data;
    } catch (error) {
      // Still clear token even if request fails
      setAuthToken(null);
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      );
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`
      );
      
      if (response.data.success && response.data.accessToken) {
        setAuthToken(response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      setAuthToken(null);
      return rejectWithValue(
        error.response?.data?.message || 'Token refresh failed'
      );
    }
  }
);

export const initializeAuthThunk = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // First try to refresh the access token using the httpOnly refresh token
      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`
      );
      
      if (refreshResponse.data.success && refreshResponse.data.accessToken) {
        setAuthToken(refreshResponse.data.accessToken);
        
        // Now check auth with the new token
        const authResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-auth`
        );
        
        return {
          accessToken: refreshResponse.data.accessToken,
          user: authResponse.data.user,
          success: authResponse.data.success
        };
      } else {
        throw new Error('No valid refresh token');
      }
    } catch (error) {
      // If refresh fails, user needs to login again
      setAuthToken(null);
      return rejectWithValue('Session expired');
    }
  }
);

export const checkAuthUser = createAsyncThunk(
  "auth/checkauth",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-auth`,
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        try {
          const refreshResponse = await dispatch(refreshAccessToken()).unwrap();
          if (refreshResponse.success) {
            // Retry checkAuth with new token
            const retryResponse = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-auth`
            );
            return retryResponse.data;
          }
        } catch (refreshError) {
          // Refresh failed, clear auth
          setAuthToken(null);
        }
      }
      
      setAuthToken(null);
      return rejectWithValue(
        error.response?.data?.message || 'Authentication check failed'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/setnewpassword`, 
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Password change failed'
      );
    }
  }
)

export const sendOtp = createAsyncThunk(
  'auth/sendOtp', 
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgotpassword`, 
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send OTP'
      );
    }
  }
)

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp', 
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verifyotp`, 
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'OTP verification failed'
      );
    }
  }
) 

export const deleteAccountAction = createAsyncThunk(
  "auth/deleteAccount",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/delete-account`,
        { data: { userId } }
      );

      // Clear auth on successful deletion
      setAuthToken(null);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete account"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: initialData,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      setAuthToken(accessToken);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      setAuthToken(null);
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Don't set authentication on register, user needs to login
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })

      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Initialize Auth
      .addCase(initializeAuthThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuthThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
        }
      })
      .addCase(initializeAuthThunk.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })

      // Check Auth
      .addCase(checkAuthUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
        }
      })
      .addCase(checkAuthUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })

      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.accessToken = action.payload.accessToken;
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Still clear auth even if logout request fails
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.error = action.payload;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Account
      .addCase(deleteAccountAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccountAction.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = null;
      })
      .addCase(deleteAccountAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;