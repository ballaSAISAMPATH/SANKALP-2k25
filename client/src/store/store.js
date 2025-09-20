import { configureStore, combineReducers } from '@reduxjs/toolkit';
import otpReducer from './otp/index.js'
import authReducer from './auth/index.js'; 
import taskReducer from './task/index.js'
const rootReducer = combineReducers({
 
  auth: authReducer,
  otp: otpReducer,
  task:taskReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
