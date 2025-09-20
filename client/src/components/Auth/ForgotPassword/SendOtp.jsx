import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';

import {  sendOTP,
  clearAllErrors,
  selectOTP  } from '../../store/auth';

const SendOtp = ({ onNext }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const {
    isSending,
    sendError,
    sendMessage,
    isOTPSent
  } = useSelector(selectOTP);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    dispatch(clearAllErrors());
    const result = await dispatch(sendOTP(email));
    
    if (sendOTP.fulfilled.match(result)) {
      // Pass the email to parent component when OTP is successfully sent
      setTimeout(() => onNext(email), 1500); // Move to verify after success message
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2">Forgot Password?</h2>
        <p className="text-gray-600">Enter your email address and we'll send you an OTP to reset your password</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            placeholder="Enter your email"
          />
        </div>

        {sendError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{sendError}</span>
          </div>
        )}

        {sendMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700 text-sm">{sendMessage}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSending || !isValidEmail(email)}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              Send OTP
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SendOtp;