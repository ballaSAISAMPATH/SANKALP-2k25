import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Brain, CheckCircle, Target, Calendar, Clock, Zap, Users, TrendingUp, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AuthLayout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  
  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b-2 border-green-500 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Back button at most left corner */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group -ml-4"
                aria-label="Go back to homepage"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-green-500 transition-colors duration-200" />
              </button>
              
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">TaskAI</h1>
                  <p className="text-sm text-gray-600">AI-Powered Task Management</p>
                </div>
              </div>
            </div>

        
          </div>
        </div>
      </div>

      <div className="flex min-h-screen pt-[80px]">
        <div className="hidden md:flex md:w-1/2 xl:w-3/5 bg-gradient-to-br from-green-50 to-green-100 p-6 lg:p-12 flex-col justify-center">
          <div className="max-w-lg mx-auto">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
                Transform Your Productivity with AI
              </h2>
              <p className="text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed">
                Let AI help you create, prioritize, break down, and schedule tasks effortlessly.
              </p>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-green-500 rounded-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">AI Task Creation</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    Simply describe what you need to do in natural language, and AI creates structured tasks
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-green-500 rounded-lg flex-shrink-0">
                  <Target className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Smart Prioritization</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    AI automatically tags urgency and importance based on context and deadlines
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-green-500 rounded-lg flex-shrink-0">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Intelligent Scheduling</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    Break down complex projects and schedule each subtask at optimal times
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="p-2.5 lg:p-3 bg-green-500 rounded-lg flex-shrink-0">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">Behavioral Learning</h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    AI learns your work patterns and suggests optimal schedules based on your behavior
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-white rounded-lg border-2 border-green-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                <span className="font-semibold text-gray-900 text-sm lg:text-base">Example in Action</span>
              </div>
              <div className="space-y-2 text-xs lg:text-sm">
                <div className="p-2.5 lg:p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">You type:</span>
                  <p className="text-green-600 italic">"Finish my React project by next week"</p>
                </div>
                <div className="text-center text-gray-400">↓</div>
                <div className="p-2.5 lg:p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">AI creates:</span>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    <li>• Setup project structure (Mon 9-11 AM)</li>
                    <li>• Build components (Tue-Wed)</li>
                    <li>• Add styling (Thu 2-5 PM)</li>
                    <li>• Testing & deployment (Fri)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 xl:w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-sm text-gray-600 text-center sm:text-left">© 2025 TaskAI. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <a 
                  onClick={() => navigate('/privacy-policy')} 
                  className="text-sm text-green-500 hover:text-green-600 cursor-pointer"
                >
                  Privacy Policy
                </a>
                <a 
                  onClick={() => navigate('/terms-service')} 
                  className="text-sm text-green-500 hover:text-green-600 cursor-pointer"
                >
                  Terms of Service
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Powered by</span>
              <Brain className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-medium">Advanced AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout