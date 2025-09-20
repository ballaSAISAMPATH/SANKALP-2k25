import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { useDispatch } from 'react-redux'
import {login} from '../../store/auth/index'
import { toast } from "sonner"
import ContinueWithGoogle from '../../components/Auth/ContinueWithGoogle';

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const result = await dispatch(login({ email, password }));
    if(result)
    {
      if(result.payload.success)
      {
        toast.success(result.payload.message);
      }
      else{
        toast.error(result.payload.message)
      }

    }
  } catch (err) {
    toast.error(err?.message || "Login failed");
    console.error("Login error:", err);
  } finally {
    setIsLoading(false);
  }
};

  return (
<div className="w-full max-w-md mx-auto lg:mt-[-18rem]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">
          Sign in to your AI-powered workspace
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-0 transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-green-500" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-0 transition-colors duration-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-green-500" />
                ) : (
                  <Eye className="h-5 w-5 text-green-500" />
                )}
              </button>
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors duration-200 cursor-pointer"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="group relative w-full cursor-pointer flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing you in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <ContinueWithGoogle />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Don't have an account?</span>
          </div>
        </div>

        <div>
          <Button
            type="button"
            onClick={() => navigate('/auth/register')}
            className="w-full flex  cursor-pointer justify-center py-3 px-4 border-2 border-green-500 text-sm font-medium rounded-lg text-green-500 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Create New Account
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold text-green-600">Ready to boost productivity?</span>
          </p>
          <p className="text-xs text-gray-600">
            Join thousands using AI to manage tasks smarter, not harder
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login