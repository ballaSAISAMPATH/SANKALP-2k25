import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

// import { clearAllErrors,clearAllMessages } from '../../store/auth';
// Success Screen Component
const SuccessScreen = ({ onContinue }) => {
  return (
    <div className="w-full max-w-md mx-auto lg:mt-[-18rem]">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">OTP Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. You can now proceed to reset your password.
          </p>

          <button
            onClick={onContinue}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Continue to Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Forgot Password Component
const ForgotPassword = () => {
  const [step, setStep] = useState('send'); // 'send', 'verify', 'success'
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear state when component mounts
    return () => {
      dispatch(clearAllErrors());
      dispatch(clearAllMessages());
    };
  }, [dispatch]);

  const handleNext = (email) => {
    setVerifiedEmail(email);
    setStep('verify');
  };

  const handleBack = () => {
    setStep('send');
  };

  const handleSuccess = () => {
    setStep('success');
  };

  const handleContinue = () => {
    // Navigate to reset password page with email as state
    navigate('/auth/change-password', { 
      state: { 
        email: verifiedEmail,
        isVerified: true 
      } 
    });
  };

  return (
    <div className="w-full max-w-md mx-auto lg:mt-[-28rem]">
      {step === 'send' && (
        <SendOtp onNext={handleNext} />
      )}

      {step === 'verify' && (
        <VerifyOtp 
          email={verifiedEmail}
          onBack={handleBack} 
          onSuccess={handleSuccess} 
        />
      )}

      {step === 'success' && (
        <SuccessScreen onContinue={handleContinue} />
      )}
    </div>
  );
};

export default ForgotPassword;