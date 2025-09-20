import { configureStore, combineReducers } from '@reduxjs/toolkit';
import otpReducer from './otp/index.js'
import authReducer from './auth/index.js'; 

const rootReducer = combineReducers({
 
  auth: authReducer,
  otp: otpReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
