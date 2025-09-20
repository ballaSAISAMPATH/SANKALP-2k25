import React from 'react';
import { Shield, Lock, Eye, UserCheck, Cookie, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GoBackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors cursor-pointer"
    >
      Go Back
    </button>
  );
};

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Go Back Button */}
        <div className="mb-8">
          <GoBackButton />
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-green-500 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 text-lg">Last Updated: July 26, 2025</p>
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="text-green-800 font-semibold text-lg">
              Your privacy is important to us.
            </p>
            <p className="text-green-700 mt-2">
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or register on our AI Task Flow web application.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Eye className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
          </div>
          <p className="text-gray-700 mb-4">When you use our platform, we collect:</p>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Personal Information</h3>
              <p className="text-green-700">Name, email address, password, and authentication provider (email or Google).</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Account Metadata</h3>
              <p className="text-green-700">Firebase UID (if signed in with Google), profile picture.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Goal Data</h3>
              <p className="text-green-700">Task goals, durations, and progress.</p>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <UserCheck className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
          </div>
          <p className="text-gray-700 mb-4">We use your information to:</p>
          <ul className="space-y-3">
            {[
              'Create and manage your account',
              'Generate AI-powered goal schedules (weekly, daily tasks)',
              'Improve user experience',
              'Communicate important updates (with your permission)'
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Lock className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">3. Data Sharing & Security</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800 font-semibold">
                We <strong>do not sell</strong> your data.
              </p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">Your data may be shared with trusted services (e.g., Firebase) for authentication and security.</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">We store your data securely using modern database practices (MongoDB & encryption for passwords).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <UserCheck className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">4. Your Rights</h2>
          </div>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="space-y-3">
            {[
              'Access, update, or delete your data',
              'Deactivate your account anytime',
              'Contact us for any privacy-related concerns'
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 5 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Cookie className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">5. Cookies and Tracking</h2>
          </div>
          <p className="text-gray-700">
            We may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings.
          </p>
        </div>

        {/* Section 6 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Eye className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">6. Changes to this Policy</h2>
          </div>
          <p className="text-gray-700">
            We may update our Privacy Policy from time to time. You will be notified of major changes through email or app notification.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-green-500 mr-3" />
            <h3 className="text-xl font-bold text-green-800">Contact</h3>
          </div>
          <p className="text-green-700">
            For questions, reach out to{' '}
            <a 
              href="mailto:praveengamini009@gmail.com" 
              className="text-green-600 hover:text-green-800 underline font-semibold"
            >
              praveengamini009@gmail.com
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 AI Task Flow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;