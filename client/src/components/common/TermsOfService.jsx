import React from 'react';
import { FileText, Users, Shield, CheckCircle, Bot, AlertTriangle, Gavel, RefreshCw, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../Auth/AuthLayout';
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

const TermsOfService = () => {
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
            <FileText className="w-12 h-12 text-green-500 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600 text-lg">Last Updated: July 26, 2025</p>
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <p className="text-green-800 font-semibold text-lg">
              By using our AI Task Flow application, you agree to abide by these terms.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">1. User Eligibility</h2>
          </div>
          <p className="text-gray-700">
            You must be at least 13 years old to use this platform. If you are under 18, you must have permission from a parent or legal guardian.
          </p>
        </div>

        {/* Section 2 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">2. Account Responsibility</h2>
          </div>
          <ul className="space-y-3">
            {[
              'Keep your login credentials confidential.',
              'You are responsible for all activity under your account.'
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
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">3. Acceptable Use</h2>
          </div>
          <p className="text-gray-700 mb-4">
            You agree <strong className="text-red-600">not</strong> to:
          </p>
          <div className="space-y-4">
            {[
              'Use the app for unlawful activities',
              'Share misleading or harmful goals',
              'Attempt to hack, reverse-engineer, or disrupt the platform'
            ].map((item, index) => (
              <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-red-800">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Bot className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">4. AI Task Generation</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-green-700">Tasks are generated based on your inputs and should be reviewed by you.</span>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-yellow-800">We do not guarantee 100% accuracy or effectiveness of goal plans.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">5. Termination</h2>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-800">
              We reserve the right to suspend or delete your account if you violate these terms or misuse the platform.
            </p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <Gavel className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700">
              We are not liable for any loss or damage arising from your use of the platform or reliance on the AI-generated tasks.
            </p>
          </div>
        </div>

        {/* Section 7 */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <RefreshCw className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">7. Changes to the Terms</h2>
          </div>
          <p className="text-gray-700">
            We may revise these terms at any time. Continued use means you accept the updated terms.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-green-500 mr-3" />
            <h3 className="text-xl font-bold text-green-800">Contact</h3>
          </div>
          <p className="text-green-700">
            For questions regarding these terms, reach out to{' '}
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

export default TermsOfService;