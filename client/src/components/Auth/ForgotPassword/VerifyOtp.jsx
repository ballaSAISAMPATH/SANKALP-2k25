import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';


import { resendOTP,
  clearAllErrors,
  updateResendCooldown,
  selectOTP } from '../../store/otp';
// Custom OTP Input Component
const InputOTP = ({ value, onChange, length = 6 }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));

  useEffect(() => {
    if (value && value.length === length) {
      setOtp(value.split(''));
    }
  }, [value, length]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }

    // Call parent onChange
    onChange(newOtp.join(''));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      e.target.previousSibling.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

const VerifyOtp = ({ onBack, onSuccess }) => {
  const dispatch = useDispatch();
  const [otpValue, setOtpValue] = useState('');
  const [cooldown, setCooldown] = useState(60);
  
  const {
    email,
    isVerifying,
    isResending,
    verifyError,
    verifyMessage,
    resendMessage,
    resendError,
    attemptCount,
    maxAttempts,
    showResendButton
  } = useSelector(selectOTP);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
        dispatch(updateResendCooldown(cooldown - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown, dispatch]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!otpValue || otpValue.length !== 6) return;

    dispatch(clearAllErrors());
    const result = await dispatch(verifyOTP({ email, otp: otpValue }));
    
    if (verifyOTP.fulfilled.match(result)) {
      setTimeout(() => onSuccess(), 1500);
    }
  };

  const handleResend = async () => {
    dispatch(clearAllErrors());
    const result = await dispatch(resendOTP(email));
    
    if (resendOTP.fulfilled.match(result)) {
      setCooldown(60);
      setOtpValue('');
    }
  };

  const canResend = (showResendButton || attemptCount >= maxAttempts) && cooldown === 0;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2">Verify OTP</h2>
        <p className="text-gray-600 mb-2">We've sent a 6-digit code to</p>
        <p className="font-medium text-black">{email}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black mb-4 text-center">
            Enter 6-digit OTP
          </label>
          <InputOTP
            value={otpValue}
            onChange={setOtpValue}
            length={6}
          />
        </div>

        {/* Attempt counter */}
        {attemptCount > 0 && attemptCount < maxAttempts && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {maxAttempts - attemptCount} attempts remaining
            </p>
          </div>
        )}

        {verifyError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{verifyError}</span>
          </div>
        )}

        {verifyMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700 text-sm">{verifyMessage}</span>
          </div>
        )}

        {resendMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700 text-sm">{resendMessage}</span>
          </div>
        )}

        {resendError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{resendError}</span>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isVerifying || otpValue.length !== 6}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>

        {/* Resend section */}
        <div className="text-center space-y-2">
          {!canResend ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              Resend OTP in {cooldown}s
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
            >
              {isResending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend OTP'
              )}
            </button>
          )}
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full border border-gray-300 hover:border-gray-400 text-black py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Change Email
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;